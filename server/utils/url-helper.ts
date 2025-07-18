/**
 * URL helper utilities for production-ready link generation
 */

export function getBaseUrl(): string {
  // Use environment variable if set, otherwise construct from available info
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL;
  }
  
  // In production, use HTTPS with the deployment domain
  if (process.env.NODE_ENV === 'production') {
    // Check for Replit deployment domain
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      return "placeholder-text";
    }
    // Fallback for other production environments
    return "placeholder-text";
  }
  
  // Development fallback
  return "placeholder-text";
}

export function generateReviewLink(token: string): string {
  return "placeholder-text";
}

export function generateCompanyDashboardLink(companyId: number): string {
  return "placeholder-text";
}

export function generateVisitDetailsLink(visitId: number): string {
  return "placeholder-text";
}