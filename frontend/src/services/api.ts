const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Tier
export const tierApi = {
  get: () => request<{ tier: 'pro' | 'advanced' }>('/tier'),
  set: (tier: 'pro' | 'advanced') => request<{ tier: 'pro' | 'advanced' }>('/tier', {
    method: 'POST',
    body: JSON.stringify({ tier }),
  }),
};

// AI Chat
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const aiChatApi = {
  chat: (messages: ChatMessage[]) => request<{ response: string }>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  }),
};

// Agent
export interface AgentTask {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: string;
  status: 'proposed' | 'approved' | 'rejected' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export const agentApi = {
  analyze: () => request<{ tasks: AgentTask[] }>('/agent/analyze', { method: 'POST' }),
  tasks: () => request<{ tasks: AgentTask[] }>('/agent/tasks'),
  approve: (taskId: string) => request<{ task: AgentTask }>(`/agent/tasks/${taskId}/approve`, { method: 'POST' }),
  reject: (taskId: string) => request<{ task: AgentTask }>(`/agent/tasks/${taskId}/reject`, { method: 'POST' }),
};

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

// Google Ads data
export interface Account {
  id: string;
  name: string;
}

export interface MetricsSummary {
  spend: number;
  conversions: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

export interface PerformancePoint {
  date: string;
  spend: number;
  conversions: number;
  impressions: number;
  clicks: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  channelType: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

export interface SearchTerm {
  searchTerm: string;
  status: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
}

export interface Recommendation {
  resourceName: string;
  type: string;
  campaign: string;
  impactImpressions: number;
  impactClicks: number;
  impactCost: number;
}

export interface HealthScore {
  score: number;
  summary: string;
  issues: { severity: 'critical' | 'warning' | 'tip'; message: string }[];
  metrics: MetricsSummary;
  recommendationCount: number;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  finalUrls: string[];
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  totalAmount: number;
  status: string;
  deliveryMethod: string;
}

export interface AuctionInsight {
  campaign: string;
  absoluteTopImpressionPct: number;
  topImpressionPct: number;
  searchImpressionShare: number;
}

interface DateParams {
  dateRange?: string;
  startDate?: string;
  endDate?: string;
}

function qs(dateRangeOrParams?: string | DateParams): string {
  if (!dateRangeOrParams) return '';
  if (typeof dateRangeOrParams === 'string') {
    return `?dateRange=${dateRangeOrParams}`;
  }
  const { dateRange, startDate, endDate } = dateRangeOrParams;
  if (startDate && endDate) {
    return `?startDate=${startDate}&endDate=${endDate}`;
  }
  return dateRange ? `?dateRange=${dateRange}` : '';
}

export const googleAdsApi = {
  accounts: () => request<{ customers: Account[]; activeCustomerId: string | null }>('/google-ads/accounts'),
  selectAccount: (customerId: string) => request<{ success: boolean }>('/google-ads/accounts/select', {
    method: 'POST',
    body: JSON.stringify({ customerId }),
  }),
  metrics: (dateRange?: string | DateParams) => request<MetricsSummary>(`/google-ads/metrics${qs(dateRange)}`),
  performance: (dateRange?: string | DateParams) => request<PerformancePoint[]>(`/google-ads/performance${qs(dateRange)}`),
  campaigns: (dateRange?: string | DateParams) => request<Campaign[]>(`/google-ads/campaigns${qs(dateRange)}`),
  searchTerms: (dateRange?: string | DateParams) => request<SearchTerm[]>(`/google-ads/search-terms${qs(dateRange)}`),
  recommendations: () => request<Recommendation[]>('/google-ads/recommendations'),
  assets: () => request<Asset[]>('/google-ads/assets'),
  budgets: () => request<Budget[]>('/google-ads/budgets'),
  auctionInsights: (dateRange?: string | DateParams) => request<AuctionInsight[]>(`/google-ads/auction-insights${qs(dateRange)}`),
  health: (dateRange?: string | DateParams) => request<HealthScore>(`/google-ads/health${qs(dateRange)}`),
  applyRecommendation: (resourceName: string) => request<{ success: boolean }>('/google-ads/recommendations/apply', {
    method: 'POST',
    body: JSON.stringify({ resourceName }),
  }),
  dismissRecommendation: (resourceName: string) => request<{ success: boolean }>('/google-ads/recommendations/dismiss', {
    method: 'POST',
    body: JSON.stringify({ resourceName }),
  }),
  setCampaignStatus: (campaignId: string, status: 'ENABLED' | 'PAUSED') => request<{ success: boolean }>(`/google-ads/campaigns/${campaignId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  }),
  excludeKeyword: (keyword: string, campaignId?: string) => request<{ success: boolean }>('/google-ads/keywords/exclude', {
    method: 'POST',
    body: JSON.stringify({ keyword, campaignId }),
  }),
};
