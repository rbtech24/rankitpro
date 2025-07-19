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
      return `${baseUrl}/review/${reviewRequest.id}`;
    }
    // Fallback for other production environments
    return `${baseUrl}/review/${reviewRequest.id}`;
  }
  
  // Development fallback
  return `${baseUrl}/review/${reviewRequest.id}`;
}

export function generateReviewLink(token: string): string {
  return `${baseUrl}/review/${reviewRequest.id}`;
}

export function generateCompanyDashboardLink(companyId: number): string {
  return `${baseUrl}/review/${reviewRequest.id}`;
}

export function generateVisitDetailsLink(visitId: number): string {
  return `${baseUrl}/review/${reviewRequest.id}`;
}