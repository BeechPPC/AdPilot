import { Router } from 'express';
import { getTierHandler, setTierHandler } from '../controllers/tierController';

const router = Router();

router.get('/', getTierHandler);
router.post('/', setTierHandler);

export default router;
