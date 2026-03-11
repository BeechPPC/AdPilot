const BASE = '/api';
const TOKEN_KEY = 'adpilot_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasToken(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Authentication required');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Admin Auth
export const adminAuthApi = {
  login: (password: string) => request<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  }),
};

// AI Chat
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const aiChatApi = {
  chat: (messages: ChatMessage[]) => request<{ response: string; toolsUsed: string[] }>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  }),
};

export interface StreamEvent {
  type: 'text' | 'tool_start' | 'tool_end' | 'done' | 'error';
  text?: string;
  tool?: string;
  toolsUsed?: string[];
  error?: string;
}

export function streamChat(
  messages: ChatMessage[],
  onEvent: (event: StreamEvent) => void,
): AbortController {
  const controller = new AbortController();
  const token = getToken();

  fetch(`${BASE}/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
    signal: controller.signal,
  }).then(async (res) => {
    if (!res.ok) {
      if (res.status === 401) {
        clearToken();
        window.location.href = '/login';
        return;
      }
      onEvent({ type: 'error', error: `Request failed: ${res.status}` });
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onEvent({ type: 'error', error: 'No response stream' });
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event: StreamEvent = JSON.parse(line.slice(6));
            onEvent(event);
          } catch {
            // skip malformed events
          }
        }
      }
    }
  }).catch((err) => {
    if (err.name !== 'AbortError') {
      onEvent({ type: 'error', error: 'Connection failed' });
    }
  });

  return controller;
}

// Auth
export const authApi = {
  getUrl: () => request<{ url: string }>('/auth/google/url'),
  callback: (code: string) => request<{ success: boolean }>('/auth/google/callback', {
    method: 'POST',
    body: JSON.stringify({ code }),
  }),
  status: () => request<{ connected: boolean }>('/auth/google/status'),
  disconnect: () => request<{ success: boolean }>('/auth/google/disconnect', { method: 'POST' }),
};

// Account Settings
export interface AccountSettings {
  businessType?: 'ecommerce' | 'lead_generation' | 'local_services';
  goalType?: 'cpa' | 'roas';
  goalTarget?: number;
  brandName?: string;
  conversionTypes?: string[];
  averageOrderValue?: number;
  leadValue?: number;
  profitMargin?: number;
  monthlyBudget?: number;
  industry?: string;
}

export const settingsApi = {
  get: () => request<AccountSettings>('/google-ads/settings'),
  save: (settings: AccountSettings) => request<{ success: boolean }>('/google-ads/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  }),
};

// Google Ads — only account management
export interface Account { id: string; name: string; }

export const googleAdsApi = {
  accounts: () => request<{ customers: Account[]; activeCustomerId: string | null }>('/google-ads/accounts'),
  selectAccount: (customerId: string) => request<{ success: boolean }>('/google-ads/accounts/select', {
    method: 'POST', body: JSON.stringify({ customerId }),
  }),
};
