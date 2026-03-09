import { GOOGLE_ADS_CONFIG } from '../config/googleAds';

class GoogleAdsAuthService {
  private static instance: GoogleAdsAuthService;

  private constructor() {}

  static getInstance(): GoogleAdsAuthService {
    if (!GoogleAdsAuthService.instance) {
      GoogleAdsAuthService.instance = new GoogleAdsAuthService();
    }
    return GoogleAdsAuthService.instance;
  }

  initiateAuth(): void {
    const params = new URLSearchParams({
      client_id: GOOGLE_ADS_CONFIG.clientId!,
      redirect_uri: GOOGLE_ADS_CONFIG.redirectUri!,
      response_type: 'code',
      scope: GOOGLE_ADS_CONFIG.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    window.location.href = `${GOOGLE_ADS_CONFIG.endpoints.auth}?${params.toString()}`;
  }

  async handleCallback(code: string): Promise<void> {
    const response = await fetch('/api/auth/google/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to exchange authorization code');
    }
  }

  async checkStatus(): Promise<boolean> {
    const response = await fetch('/api/auth/google/status');
    const data = await response.json();
    return data.connected;
  }

  async disconnect(): Promise<void> {
    await fetch('/api/auth/google/disconnect', { method: 'POST' });
  }
}

export const googleAdsAuth = GoogleAdsAuthService.getInstance();
