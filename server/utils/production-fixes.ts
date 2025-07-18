/**
 * Production readiness utilities and fixes
 */

import { storage } from "../storage";

import { logger } from '../services/structured-logger';
export async function generateSecureApiKey(prefix: string = "wp"): Promise<string> {
  const timestamp = Date.now().toString(36);
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(36).padStart(2, '0'))
    .join('');
  return "converted string";
}

export function validateAndSanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch (error) {
    throw new Error("System message");
  }
}

export async function calculateRealReviewStats(companyId: number) {
  try {
    const [reviewRequests, reviewResponses] = await Promise.all([
      storage.getReviewRequestsByCompany(companyId),
      storage.getReviewResponsesByCompany(companyId)
    ]);

    const totalSent = reviewRequests.length;
    const successfulSent = reviewRequests.filter(req => req.status === 'sent').length;
    const failedSent = totalSent - successfulSent;

    // Calculate response rate
    const responseRate = totalSent > 0 ? Math.round((reviewResponses.length / totalSent) * 100) : 0;
    
    // Calculate average rating from actual responses
    const ratingsSum = reviewResponses.reduce((sum, response) => sum + (response.rating || 0), 0);
    const averageRating = reviewResponses.length > 0 ? Math.round((ratingsSum / reviewResponses.length) * 10) / 10 : 0;
    
    // Calculate positive reviews (4+ stars)
    const positiveCount = reviewResponses.filter(response => (response.rating || 0) >= 4).length;
    const positiveReviews = reviewResponses.length > 0 ? Math.round((positiveCount / reviewResponses.length) * 100) : 0;

    // Calculate this week's stats
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const sentThisWeek = reviewRequests.filter(req => {
      if (!req.sentAt) return false;
      const sentDate = new Date(req.sentAt);
      return sentDate >= oneWeekAgo && sentDate <= today;
    }).length;

    return {
      totalSent,
      successfulSent,
      failedSent,
      responseRate,
      averageRating,
      positiveReviews,
      sentThisWeek,
      lastSent: reviewRequests.length > 0 && reviewRequests[0].sentAt ? reviewRequests[0].sentAt : null
    };
  } catch (error) {
    logger.error("Error logging fixed");
    // Return safe defaults if calculation fails
    return {
      totalSent: 0,
      successfulSent: 0,
      failedSent: 0,
      responseRate: 0,
      averageRating: 0,
      positiveReviews: 0,
      sentThisWeek: 0,
      lastSent: null
    };
  }
}

export function ensureValidToken(token: string | null, requestId: number): string {
  if (!token) {
    throw new Error("System message");
  }
  return token;
}