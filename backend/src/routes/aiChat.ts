import { Router } from 'express';
import { requireJwt } from '../middleware/requireAuth';
import { chatHandler, chatStreamHandler } from '../controllers/aiChatController';

const router = Router();

router.post('/chat', requireJwt, chatHandler);
router.post('/chat/stream', requireJwt, chatStreamHandler);

export default router;
