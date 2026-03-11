// Centralized localStorage utility for AdPilot

const KEYS = {
  THEME: 'adpilot_theme',
  CONVERSATIONS: 'adpilot_conversations',
  ACTIVE_CONVERSATION: 'adpilot_active_conversation',
  PINS: 'adpilot_pins',
} as const;

const MAX_CONVERSATIONS = 50;
const MAX_PINS = 100;

// --- Theme ---

export function loadTheme(): 'light' | 'dark' {
  try {
    const val = localStorage.getItem(KEYS.THEME);
    return val === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(mode: 'light' | 'dark'): void {
  try {
    localStorage.setItem(KEYS.THEME, mode);
  } catch {
    // Storage full or unavailable
  }
}

// --- Conversations ---

export interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: DisplayMessage[];
  createdAt: number;
  updatedAt: number;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(KEYS.CONVERSATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    const trimmed = conversations
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_CONVERSATIONS);
    localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(trimmed));
  } catch {
    // Storage full
  }
}

export function loadActiveConversationId(): string | null {
  try {
    return localStorage.getItem(KEYS.ACTIVE_CONVERSATION);
  } catch {
    return null;
  }
}

export function saveActiveConversationId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(KEYS.ACTIVE_CONVERSATION, id);
    } else {
      localStorage.removeItem(KEYS.ACTIVE_CONVERSATION);
    }
  } catch {
    // Storage full or unavailable
  }
}

// --- Pinned Insights ---

export interface PinnedInsight {
  id: string;
  content: string;
  conversationId: string;
  conversationTitle: string;
  timestamp: number;
  pinnedAt: number;
}

export function loadPins(): PinnedInsight[] {
  try {
    const raw = localStorage.getItem(KEYS.PINS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePins(pins: PinnedInsight[]): void {
  try {
    const trimmed = pins.slice(0, MAX_PINS);
    localStorage.setItem(KEYS.PINS, JSON.stringify(trimmed));
  } catch {
    // Storage full
  }
}
