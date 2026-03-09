import { Request, Response } from 'express';
import { getCustomerId, setCustomerId } from '../services/googleAdsAuth';
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

function getDateRange(req: Request): string {
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
    const message = error instanceof Error ? error.message : 'Failed to list accounts';
    res.status(500).json({ error: message });
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
    const message = error instanceof Error ? error.message : 'Failed to select account';
    res.status(500).json({ error: message });
  }
}

export async function metrics(req: Request, res: Response): Promise<void> {
  try {
    const data = await getMetricsSummary(getDateRange(req));
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch metrics';
    res.status(500).json({ error: message });
  }
}

export async function performance(req: Request, res: Response): Promise<void> {
  try {
    const data = await getPerformanceTimeSeries(getDateRange(req));
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch performance data';
    res.status(500).json({ error: message });
  }
}

export async function campaigns(req: Request, res: Response): Promise<void> {
  try {
    const data = await getCampaigns(getDateRange(req));
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch campaigns';
    res.status(500).json({ error: message });
  }
}

export async function searchTerms(req: Request, res: Response): Promise<void> {
  try {
    const data = await getSearchTerms(getDateRange(req));
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch search terms';
    res.status(500).json({ error: message });
  }
}

export async function recommendations(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getRecommendations();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch recommendations';
    res.status(500).json({ error: message });
  }
}

export async function assets(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getAssets();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch assets';
    res.status(500).json({ error: message });
  }
}

export async function budgets(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getBudgets();
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch budgets';
    res.status(500).json({ error: message });
  }
}

export async function auctionInsights(req: Request, res: Response): Promise<void> {
  try {
    const data = await getAuctionInsights(getDateRange(req));
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch auction insights';
    res.status(500).json({ error: message });
  }
}

export async function healthScore(req: Request, res: Response): Promise<void> {
  try {
    const data = await getHealthScore(getDateRange(req));
    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to compute health score';
    res.status(500).json({ error: message });
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
    const message = error instanceof Error ? error.message : 'Failed to apply recommendation';
    res.status(500).json({ error: message });
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
    const message = error instanceof Error ? error.message : 'Failed to dismiss recommendation';
    res.status(500).json({ error: message });
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
    const message = error instanceof Error ? error.message : 'Failed to update campaign';
    res.status(500).json({ error: message });
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
    const message = error instanceof Error ? error.message : 'Failed to exclude keyword';
    res.status(500).json({ error: message });
  }
}
