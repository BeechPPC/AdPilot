import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../config/auth';
import { isAuthenticated } from '../services/googleAdsAuth';

export function requireJwt(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.slice(7);
  try {
    jwt.verify(token, AUTH_CONFIG.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireGoogleAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isAuthenticated()) {
    res.status(401).json({ error: 'Not authenticated. Connect Google Ads first.' });
    return;
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  requireJwt(req, res, () => {
    requireGoogleAuth(req, res, next);
  });
}
