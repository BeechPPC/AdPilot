import { Request, Response, NextFunction } from 'express';
import { isAuthenticated } from '../services/googleAdsAuth';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isAuthenticated()) {
    res.status(401).json({ error: 'Not authenticated. Connect Google Ads first.' });
    return;
  }
  next();
}
