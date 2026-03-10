import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireTier } from '../middleware/requireTier';
import { mutationLimiter } from '../middleware/rateLimiter';
import { analyzeHandler, listTasksHandler, approveTaskHandler, rejectTaskHandler } from '../controllers/agentController';

const router = Router();

router.post('/analyze', requireAuth, requireTier('advanced'), analyzeHandler);
router.get('/tasks', requireAuth, requireTier('advanced'), listTasksHandler);
router.post('/tasks/:id/approve', requireAuth, requireTier('advanced'), mutationLimiter, approveTaskHandler);
router.post('/tasks/:id/reject', requireAuth, requireTier('advanced'), rejectTaskHandler);

export default router;
