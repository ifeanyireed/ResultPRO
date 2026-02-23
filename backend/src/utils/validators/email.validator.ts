export class EmailValidator {
  static validate(email: string): boolean {
    // RFC 5322 simplified email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static isValidNigerian(email: string): boolean {
    return this.validate(email);
  }
}
