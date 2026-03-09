import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireTier } from '../middleware/requireTier';
import { chatHandler } from '../controllers/aiChatController';

const router = Router();

router.post('/chat', requireAuth, requireTier('advanced'), chatHandler);

export default router;
