export class OtpHelper {
  /**
   * Generate a random OTP of specified length
   * @param length Length of OTP (default: 6)
   * @returns OTP string
   */
  static generate(length: number = 6): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  /**
   * Generate OTP with expiration time
   * @param length Length of OTP
   * @param expiryMinutes Expiry time in minutes
   * @returns Object with OTP and expiry time
   */
  static generateWithExpiry(length: number = 6, expiryMinutes: number = 10) {
    const otp = this.generate(length);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

    return {
      otp,
      expiresAt,
    };
  }

  /**
   * Validate if OTP is expired
   * @param expiresAt Expiry time
   * @returns boolean
   */
  static isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}
