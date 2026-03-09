import { Request, Response } from 'express';
import { getTier, setTier } from '../services/tierService';

export function getTierHandler(req: Request, res: Response): void {
  res.json({ tier: getTier() });
}

export function setTierHandler(req: Request, res: Response): void {
  const { tier } = req.body;
  if (!tier || (tier !== 'pro' && tier !== 'advanced')) {
    res.status(400).json({ error: 'Invalid tier. Must be "pro" or "advanced".' });
    return;
  }
  setTier(tier);
  res.json({ tier: getTier() });
}
