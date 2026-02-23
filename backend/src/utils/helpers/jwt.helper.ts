import jwt from 'jsonwebtoken';
import { config } from '@config/environment';

interface TokenPayload {
  id: string;
  schoolId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class JwtHelper {
  static generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const options: any = { expiresIn: config.jwt.expire };
    return jwt.sign(payload, config.jwt.secret, options) as string;
  }

  static generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const options: any = { expiresIn: config.jwt.refreshExpire };
    return jwt.sign(payload, config.jwt.refreshSecret, options) as string;
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error: any) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
    } catch (error: any) {
      throw new Error(`Refresh token verification failed: ${error.message}`);
    }
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }
}
