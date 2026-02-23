export class PhoneValidator {
  static validateNigeria(phone: string): boolean {
    // Nigerian phone format: +234 XXX XXX XXXX or 0XXX XXX XXXX
    const nigerianPhoneRegex = /^(\+234|0)[0-9]{10}$/;
    const cleanedPhone = phone.replace(/\s|-/g, '');
    return nigerianPhoneRegex.test(cleanedPhone);
  }

  static formatNigeria(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('234')) {
      return `+${cleaned}`;
    }

    if (cleaned.startsWith('0')) {
      return `+234${cleaned.substring(1)}`;
    }

    return phone;
  }

  static normalize(phone: string): string {
    return phone.replace(/\s|-|\(|\)/g, '');
  }
}
