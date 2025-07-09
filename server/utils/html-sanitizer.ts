/**
 * HTML Sanitization Utilities
 * Provides safe HTML handling to prevent XSS attacks
 */

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe || typeof unsafe !== 'string') {
    return '';
  }
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes user input for safe display
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove any HTML tags and escape special characters
  return escapeHtml(input.replace(/<[^>]*>/g, ''));
}

/**
 * Sanitizes URL to prevent javascript: and data: schemes
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  // Remove dangerous protocols
  const dangerous = /^(javascript|data|vbscript|about):/i;
  if (dangerous.test(url.trim())) {
    return '';
  }
  
  // Ensure URL starts with http:// or https:// or is relative
  if (!url.match(/^https?:\/\//) && !url.match(/^\//) && !url.match(/^#/)) {
    return '';
  }
  
  return url;
}

/**
 * Creates safe HTML attribute string
 */
export function createSafeAttribute(name: string, value: string): string {
  const safeName = name.replace(/[^a-zA-Z0-9-]/g, '');
  const safeValue = escapeHtml(value);
  return `${safeName}="${safeValue}"`;
}

/**
 * Creates safe text content for DOM insertion
 */
export function createSafeTextContent(text: string): string {
  return sanitizeText(text);
}