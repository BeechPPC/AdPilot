import fs from 'fs';
import path from 'path';
import { GOOGLE_ADS_CONFIG } from '../config/googleAds';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  customerId: string | null;
  loginCustomerId: string | null;
  managerIds: string[];
}

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp')
  : path.join(__dirname, '../../data');
const TOKEN_PATH = path.join(DATA_DIR, 'tokens.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadTokens(): TokenData | null {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const raw = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
      return { ...raw, managerIds: raw.managerIds ?? [] };
    }
  } catch {
    // Corrupted file — ignore
  }
  return null;
}

function saveTokens(data: TokenData): void {
  ensureDataDir();
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(data, null, 2));
}

function deleteTokens(): void {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
    }
  } catch {
    // Ignore
  }
}

let tokenData: TokenData | null = loadTokens();

export async function exchangeCodeForTokens(code: string): Promise<void> {
  const response = await fetch(GOOGLE_ADS_CONFIG.endpoints.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_ADS_CONFIG.clientId,
      client_secret: GOOGLE_ADS_CONFIG.clientSecret,
      redirect_uri: GOOGLE_ADS_CONFIG.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await response.json();
  tokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    customerId: tokenData?.customerId ?? null,
    loginCustomerId: tokenData?.loginCustomerId ?? null,
    managerIds: tokenData?.managerIds ?? [],
  };
  saveTokens(tokenData);
}

export async function refreshAccessToken(): Promise<void> {
  if (!tokenData?.refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(GOOGLE_ADS_CONFIG.endpoints.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_ADS_CONFIG.clientId,
      client_secret: GOOGLE_ADS_CONFIG.clientSecret,
      refresh_token: tokenData.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const data = await response.json();
  tokenData = {
    ...tokenData,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  saveTokens(tokenData);
}

export async function getValidAccessToken(): Promise<string> {
  if (!tokenData) {
    throw new Error('Not authenticated');
  }

  if (Date.now() >= tokenData.expiresAt - 60_000) {
    await refreshAccessToken();
  }

  return tokenData.accessToken;
}

export function isAuthenticated(): boolean {
  return tokenData !== null;
}

export function getCustomerId(): string | null {
  return tokenData?.customerId ?? null;
}

export function getLoginCustomerId(): string | null {
  return tokenData?.loginCustomerId ?? null;
}

export function getManagerIds(): string[] {
  return tokenData?.managerIds ?? [];
}

export function setCustomerId(id: string): void {
  if (!tokenData) throw new Error('Not authenticated');
  tokenData.customerId = id;
  saveTokens(tokenData);
}

export function setLoginCustomerId(id: string): void {
  if (!tokenData) throw new Error('Not authenticated');
  tokenData.loginCustomerId = id;
  saveTokens(tokenData);
}

export function setManagerIds(ids: string[]): void {
  if (!tokenData) throw new Error('Not authenticated');
  tokenData.managerIds = ids;
  saveTokens(tokenData);
}

export function clearTokens(): void {
  tokenData = null;
  deleteTokens();
}
