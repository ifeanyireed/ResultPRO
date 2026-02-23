import { prisma } from '@config/database';

interface OtpStore {
  [email: string]: {
    otp: string;
    expiresAt: Date;
    attempts: number;
  };
}

/**
 * In-memory OTP storage (for development)
 * In production, use Redis or database
 */
const otpStore: OtpStore = {};

export class OtpService {
  /**
   * Generate and store OTP
   */
  async generateOtp(email: string): Promise<string> {
    const otp = Math.random().toString().slice(2, 8).padStart(6, '0');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    otpStore[email] = {
      otp,
      expiresAt,
      attempts: 0,
    };

    return otp;
  }

  /**
   * Verify OTP
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const stored = otpStore[email];

    if (!stored) {
      return false;
    }

    if (stored.attempts >= 3) {
      delete otpStore[email];
      throw new Error('Too many incorrect attempts. OTP has been invalidated.');
    }

    if (new Date() > stored.expiresAt) {
      delete otpStore[email];
      throw new Error('OTP has expired');
    }

    if (stored.otp !== otp) {
      stored.attempts++;
      throw new Error('Invalid OTP');
    }

    delete otpStore[email];
    return true;
  }

  /**
   * Invalidate OTP
   */
  invalidateOtp(email: string): void {
    delete otpStore[email];
  }

  /**
   * Check if OTP exists for email
   */
  hasOtp(email: string): boolean {
    return !!otpStore[email];
  }

  /**
   * Get OTP expiry time
   */
  getOtpExpiry(email: string): Date | null {
    return otpStore[email]?.expiresAt || null;
  }
}

export const otpService = new OtpService();
