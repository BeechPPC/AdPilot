import { Router } from 'express';
import { requireJwt } from '../middleware/requireAuth';
import { getTierHandler, setTierHandler } from '../controllers/tierController';

const router = Router();

router.get('/', requireJwt, getTierHandler);
router.post('/', requireJwt, setTierHandler);

export default router;
