import { Request, Response } from 'express';
import { getCustomerId, setCustomerId } from '../services/googleAdsAuth';
import { getAccountSettings, saveAccountSettings } from '../services/accountSettingsService';
import {
  listAccessibleCustomers,
  getMetricsSummary,
  getPerformanceTimeSeries,
  getCampaigns,
  getSearchTerms,
  getRecommendations,
  getAssets,
  getBudgets,
  getAuctionInsights,
  getHealthScore,
  applyRecommendation,
  dismissRecommendation,
  setCampaignStatus,
  addNegativeKeyword,
} from '../services/googleAdsApi';

function isValidDate(dateStr: string): boolean {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 2000) return false;

  const today = new Date();
  const date = new Date(year, month - 1, day);

  // Check that the date components didn't overflow (e.g. Feb 30 becomes Mar 2)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false;
  }

  // Must not be in the future
  if (date > today) return false;

  return true;
}

function getDateRange(req: Request): string {
  const startDate = String(req.query.startDate ?? '');
  const endDate = String(req.query.endDate ?? '');

  if (startDate && endDate) {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      throw new Error('Invalid date format or value');
    }
    if (startDate > endDate) {
      throw new Error('startDate must be before or equal to endDate');
    }
    return `BETWEEN '${startDate}' AND '${endDate}'`;
  }

  const allowed = ['LAST_7_DAYS', 'LAST_14_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS', 'THIS_MONTH', 'LAST_MONTH'];
  const range = String(req.query.dateRange ?? 'LAST_30_DAYS');
  return allowed.includes(range) ? range : 'LAST_30_DAYS';
}

export async function listAccounts(_req: Request, res: Response): Promise<void> {
  try {
    const customers = await listAccessibleCustomers();
    const activeId = getCustomerId();
    res.json({ customers, activeCustomerId: activeId });
  } catch (error: unknown) {
    console.error('List accounts error:', error);
    res.status(500).json({ error: 'Failed to list accounts' });
  }
}

export async function selectAccount(req: Request, res: Response): Promise<void> {
  const { customerId } = req.body;
  if (!customerId || typeof customerId !== 'string') {
    res.status(400).json({ error: 'Missing customerId' });
    return;
  }
  try {
    setCustomerId(customerId);
    res.json({ success: true, customerId });
  } catch (error: unknown) {
    console.error('Select account error:', error);
    res.status(500).json({ error: 'Failed to select account' });
  }
}

export async function metrics(req: Request, res: Response): Promise<void> {
  try {
    const data = await getMetricsSummary(getDateRange(req));
    res.json(data);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith('Invalid date')) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}

export async function performance(req: Request, res: Response): Promise<void> {
  try {
    const data = await getPerformanceTimeSeries(getDateRange(req));
    res.json(data);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith('Invalid date')) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Performance error:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
}

export async function campaigns(req: Request, res: Response): Promise<void> {
  try {
    const data = await getCampaigns(getDateRange(req));
    res.json(data);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith('Invalid date')) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
}

export async function searchTerms(req: Request, res: Response): Promise<void> {
  try {
    const data = await getSearchTerms(getDateRange(req));
    res.json(data);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith('Invalid date')) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Search terms error:', error);
    res.status(500).json({ error: 'Failed to fetch search terms' });
  }
}

export async function recommendations(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getRecommendations();
    res.json(data);
  } catch (error: unknown) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
}

export async function assets(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getAssets();
    res.json(data);
  } catch (error: unknown) {
    console.error('Assets error:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
}

export async function budgets(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getBudgets();
    res.json(data);
  } catch (error: unknown) {
    console.error('Budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
}

export async function auctionInsights(req: Request, res: Response): Promise<void> {
  try {
    const data = await getAuctionInsights(getDateRange(req));
    res.json(data);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith('Invalid date')) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Auction insights error:', error);
    res.status(500).json({ error: 'Failed to fetch auction insights' });
  }
}

export async function healthScore(req: Request, res: Response): Promise<void> {
  try {
    const data = await getHealthScore(getDateRange(req));
    res.json(data);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith('Invalid date')) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Health score error:', error);
    res.status(500).json({ error: 'Failed to compute health score' });
  }
}

export async function applyRec(req: Request, res: Response): Promise<void> {
  const { resourceName } = req.body;
  if (!resourceName || typeof resourceName !== 'string') {
    res.status(400).json({ error: 'Missing resourceName' });
    return;
  }
  try {
    await applyRecommendation(resourceName);
    res.json({ success: true });
  } catch (error: unknown) {
    console.error('Apply recommendation error:', error);
    res.status(500).json({ error: 'Failed to apply recommendation' });
  }
}

export async function dismissRec(req: Request, res: Response): Promise<void> {
  const { resourceName } = req.body;
  if (!resourceName || typeof resourceName !== 'string') {
    res.status(400).json({ error: 'Missing resourceName' });
    return;
  }
  try {
    await dismissRecommendation(resourceName);
    res.json({ success: true });
  } catch (error: unknown) {
    console.error('Dismiss recommendation error:', error);
    res.status(500).json({ error: 'Failed to dismiss recommendation' });
  }
}

export async function updateCampaignStatus(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params;
  const { status } = req.body;
  if (!status || (status !== 'ENABLED' && status !== 'PAUSED')) {
    res.status(400).json({ error: 'Status must be ENABLED or PAUSED' });
    return;
  }
  try {
    await setCampaignStatus(campaignId, status);
    res.json({ success: true });
  } catch (error: unknown) {
    console.error('Update campaign status error:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
}

export async function getSettings(_req: Request, res: Response): Promise<void> {
  try {
    const settings = getAccountSettings();
    res.json(settings || {});
  } catch (error: unknown) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    saveAccountSettings(req.body);
    res.json({ success: true });
  } catch (error: unknown) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
}

export async function excludeKeyword(req: Request, res: Response): Promise<void> {
  const { keyword, campaignId } = req.body;
  if (!keyword || typeof keyword !== 'string') {
    res.status(400).json({ error: 'Missing keyword' });
    return;
  }
  try {
    await addNegativeKeyword(keyword, campaignId);
    res.json({ success: true });
  } catch (error: unknown) {
    console.error('Exclude keyword error:', error);
    res.status(500).json({ error: 'Failed to exclude keyword' });
  }
}
