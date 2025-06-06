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
      return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
    }
    // Fallback for other production environments
    return `https://${process.env.HOST || 'localhost'}:${process.env.PORT || 5000}`;
  }
  
  // Development fallback
  return `http://localhost:${process.env.PORT || 5000}`;
}

export function generateReviewLink(token: string): string {
  return `${getBaseUrl()}/review/${token}`;
}

export function generateCompanyDashboardLink(companyId: number): string {
  return `${getBaseUrl()}/dashboard?company=${companyId}`;
}

export function generateVisitDetailsLink(visitId: number): string {
  return `${getBaseUrl()}/visits/${visitId}`;
}