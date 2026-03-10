import { Router } from 'express';
import { login } from '../controllers/adminAuthController';

const router = Router();

router.post('/login', login);

export default router;
