import { Request, Response, NextFunction } from 'express';
import { config } from '@config/environment';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  let response: any = {
    success: false,
    error: message,
    code,
  };

  if (config.DEBUG) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}
