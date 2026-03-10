import fs from 'fs';
import path from 'path';

type Tier = 'pro' | 'advanced';

interface TierData {
  tier: Tier;
}

// Use /tmp on serverless (read-only filesystem), local data dir otherwise
const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp')
  : path.join(__dirname, '../../data');
const TIER_FILE = path.join(DATA_DIR, 'tier.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readTierData(): TierData {
  ensureDataDir();
  if (!fs.existsSync(TIER_FILE)) {
    const defaultData: TierData = { tier: 'pro' };
    fs.writeFileSync(TIER_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(TIER_FILE, 'utf-8'));
}

function writeTierData(data: TierData): void {
  ensureDataDir();
  fs.writeFileSync(TIER_FILE, JSON.stringify(data, null, 2));
}

export function getTier(): Tier {
  return readTierData().tier;
}

export function setTier(tier: Tier): void {
  if (tier !== 'pro' && tier !== 'advanced') {
    throw new Error('Invalid tier. Must be "pro" or "advanced".');
  }
  writeTierData({ tier });
}

export function isAdvanced(): boolean {
  return getTier() === 'advanced';
}
