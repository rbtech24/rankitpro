/**
 * String helper utilities for production environments
 */

export function ensureString(value: string | undefined | null, fallback: string = ""): string {
  return value ?? fallback;
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function generateUniqueId(prefix: string = "id"): string {
  return `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`;
}

export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`;
  }
  
  return phone; // Return original if not 10 digits
}