import { Router } from 'express';
import { requireJwt } from '../middleware/requireAuth';
import {
  getAuthUrl,
  handleCallback,
  getStatus,
  disconnect,
} from '../controllers/googleAdsAuthController';

const router = Router();

router.get('/url', requireJwt, getAuthUrl);
router.post('/callback', requireJwt, handleCallback);
router.get('/status', requireJwt, getStatus);
router.post('/disconnect', requireJwt, disconnect);

export default router;
