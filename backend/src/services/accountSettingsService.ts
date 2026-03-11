import fs from 'fs';
import path from 'path';

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

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp')
  : path.join(__dirname, '../../data');
const SETTINGS_PATH = path.join(DATA_DIR, 'settings.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getAccountSettings(): AccountSettings | null {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to read account settings:', err);
  }
  return null;
}

export function saveAccountSettings(settings: AccountSettings): void {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

export function clearAccountSettings(): void {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      fs.unlinkSync(SETTINGS_PATH);
    }
  } catch (err) {
    console.error('Failed to clear account settings:', err);
  }
}
