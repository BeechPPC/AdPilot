import { Router } from 'express';
import {
  getAuthUrl,
  handleCallback,
  getStatus,
  disconnect,
} from '../controllers/googleAdsAuthController';

const router = Router();

router.get('/url', getAuthUrl);
router.post('/callback', handleCallback);
router.get('/status', getStatus);
router.post('/disconnect', disconnect);

export default router;
