import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config/environment';
import { UnauthorizedException } from '@modules/common/exceptions/unauthorized.exception';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        schoolId: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const decoded: any = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error instanceof UnauthorizedException) {
      return res.status(401).json({
        success: false,
        error: error.message,
        code: error.code,
      });
    }

    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
  }
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}
