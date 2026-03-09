import { Request, Response } from 'express';
import { GOOGLE_ADS_CONFIG } from '../config/googleAds';
import {
  exchangeCodeForTokens,
  isAuthenticated,
  clearTokens,
} from '../services/googleAdsAuth';

export function getAuthUrl(_req: Request, res: Response): void {
  const params = new URLSearchParams({
    client_id: GOOGLE_ADS_CONFIG.clientId,
    redirect_uri: GOOGLE_ADS_CONFIG.redirectUri,
    response_type: 'code',
    scope: GOOGLE_ADS_CONFIG.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });

  const url = `${GOOGLE_ADS_CONFIG.endpoints.auth}?${params.toString()}`;
  res.json({ url });
}

export async function handleCallback(req: Request, res: Response): Promise<void> {
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Missing authorization code' });
    return;
  }

  try {
    await exchangeCodeForTokens(code);
    res.json({ success: true });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to exchange authorization code' });
  }
}

export function getStatus(_req: Request, res: Response): void {
  res.json({ connected: isAuthenticated() });
}

export function disconnect(_req: Request, res: Response): void {
  clearTokens();
  res.json({ success: true });
}
