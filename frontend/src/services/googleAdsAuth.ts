import { GOOGLE_ADS_CONFIG } from '../config/googleAds';

class GoogleAdsAuthService {
  private static instance: GoogleAdsAuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {}

  static getInstance(): GoogleAdsAuthService {
    if (!GoogleAdsAuthService.instance) {
      GoogleAdsAuthService.instance = new GoogleAdsAuthService();
    }
    return GoogleAdsAuthService.instance;
  }

  // Initialize OAuth flow
  async initiateAuth(): Promise<void> {
    const params = new URLSearchParams({
      client_id: GOOGLE_ADS_CONFIG.clientId!,
      redirect_uri: GOOGLE_ADS_CONFIG.redirectUri!,
      response_type: 'code',
      scope: GOOGLE_ADS_CONFIG.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    window.location.href = `${GOOGLE_ADS_CONFIG.endpoints.auth}?${params.toString()}`;
  }

  // Handle OAuth callback
  async handleCallback(code: string): Promise<void> {
    try {
      const response = await fetch(GOOGLE_ADS_CONFIG.endpoints.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_ADS_CONFIG.clientId!,
          client_secret: GOOGLE_ADS_CONFIG.clientSecret!,
          redirect_uri: GOOGLE_ADS_CONFIG.redirectUri!,
          grant_type: 'authorization_code',
        }),
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;

      // Store tokens securely
      if (this.refreshToken) {
        localStorage.setItem('googleAdsRefreshToken', this.refreshToken);
      }
    } catch (error) {
      console.error('Error during OAuth callback:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(GOOGLE_ADS_CONFIG.endpoints.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_ADS_CONFIG.clientId!,
          client_secret: GOOGLE_ADS_CONFIG.clientSecret!,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();
      this.accessToken = data.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Logout
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('googleAdsRefreshToken');
  }
}

export const googleAdsAuth = GoogleAdsAuthService.getInstance(); 