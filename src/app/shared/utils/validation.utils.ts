export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  }

  static sanitizeInput(input: string): string {
    return input.replace(/<[^>]*>?/gm, '').trim();
  }

  static validateRequired(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  static validateMinLength(value: string, minLength: number): boolean {
    return Boolean(value && value.length >= minLength);
  }

  static validateMaxLength(value: string, maxLength: number): boolean {
    return !value || value.length <= maxLength;
  }

  static validateNumeric(value: string): boolean {
    return /^\d+$/.test(value);
  }

  static validateDecimal(value: string): boolean {
    return /^\d+(\.\d{1,2})?$/.test(value);
  }

  static validateDateRange(startDate: Date, endDate: Date): boolean {
    return startDate <= endDate;
  }

  static getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  }
}