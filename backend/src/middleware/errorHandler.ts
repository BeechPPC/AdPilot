import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const SENSITIVE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g,
  /ya29\.[A-Za-z0-9\-._~+/]+/g,
  /AIza[A-Za-z0-9\-._~+/]{35}/g,
  /[a-f0-9]{32,}/gi,
];

export function sanitizeErrorMessage(message: string): string {
  let sanitized = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  return sanitized;
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: sanitizeErrorMessage(err.message),
    });
  }

  console.error('ERROR:', err);

  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : sanitizeErrorMessage(err.message || 'Something went wrong');

  return res.status(500).json({
    status: 'error',
    message,
  });
};
