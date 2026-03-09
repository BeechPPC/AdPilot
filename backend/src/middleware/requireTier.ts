import { Request, Response, NextFunction } from 'express';
import { getTier } from '../services/tierService';

type Tier = 'pro' | 'advanced';

const tierLevel: Record<Tier, number> = { pro: 1, advanced: 2 };

export function requireTier(required: Tier) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const current = getTier();
    if (tierLevel[current] < tierLevel[required]) {
      res.status(403).json({
        error: 'Upgrade to Advanced to access this feature',
        requiredTier: required,
      });
      return;
    }
    next();
  };
}
