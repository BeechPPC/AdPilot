import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../config/auth';

export async function login(req: Request, res: Response): Promise<void> {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  if (!AUTH_CONFIG.adminPasswordHash) {
    console.error('ADMIN_PASSWORD_HASH is not configured');
    res.status(500).json({ error: 'Authentication is not configured' });
    return;
  }

  try {
    const valid = await bcrypt.compare(password, AUTH_CONFIG.adminPasswordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const token = jwt.sign({ role: 'admin' }, AUTH_CONFIG.jwtSecret, {
      expiresIn: AUTH_CONFIG.jwtExpiresIn,
    });

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}
