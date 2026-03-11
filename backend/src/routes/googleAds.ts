import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { mutationLimiter } from '../middleware/rateLimiter';
import {
  listAccounts,
  selectAccount,
  metrics,
  performance,
  campaigns,
  searchTerms,
  recommendations,
  assets,
  budgets,
  auctionInsights,
  healthScore,
  applyRec,
  dismissRec,
  updateCampaignStatus,
  excludeKeyword,
  getSettings,
  updateSettings,
} from '../controllers/googleAdsController';

const router = Router();

router.use(requireAuth);

// Read endpoints
router.get('/accounts', listAccounts);
router.post('/accounts/select', selectAccount);
router.get('/metrics', metrics);
router.get('/performance', performance);
router.get('/campaigns', campaigns);
router.get('/search-terms', searchTerms);
router.get('/recommendations', recommendations);
router.get('/assets', assets);
router.get('/budgets', budgets);
router.get('/auction-insights', auctionInsights);
router.get('/health', healthScore);
router.get('/settings', getSettings);
router.post('/settings', updateSettings);

// Action endpoints with mutation rate limiting
router.post('/recommendations/apply', mutationLimiter, applyRec);
router.post('/recommendations/dismiss', mutationLimiter, dismissRec);
router.post('/campaigns/:campaignId/status', mutationLimiter, updateCampaignStatus);
router.post('/keywords/exclude', mutationLimiter, excludeKeyword);

export default router;
