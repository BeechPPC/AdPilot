import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
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

// Action endpoints
router.post('/recommendations/apply', applyRec);
router.post('/recommendations/dismiss', dismissRec);
router.post('/campaigns/:campaignId/status', updateCampaignStatus);
router.post('/keywords/exclude', excludeKeyword);

export default router;
