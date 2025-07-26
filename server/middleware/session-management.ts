/**
 * Session Management Middleware
 * Handles session timeout, concurrent sessions, and security
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger';

// Track active sessions per user
const userSessions = new Map<number, Set<string>>();
const sessionLastActivity = new Map<string, Date>();

// Session configuration
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours in development
const MAX_CONCURRENT_SESSIONS = 3; // Maximum concurrent sessions per user

export interface SessionRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    companyId?: number;
  };
}

/**
 * Enforce session timeout
 */
export function enforceSessionTimeout(req: SessionRequest, res: Response, next: NextFunction) {
  const sessionId = req.sessionID;
  const now = new Date();

  // Skip for non-authenticated requests
  if (!req.session?.userId) {
    return next();
  }

  // Check if session has timed out
  const lastActivity = sessionLastActivity.get(sessionId);
  if (lastActivity && (now.getTime() - lastActivity.getTime()) > SESSION_TIMEOUT) {
    logger.security('Session timeout', 'info' as any, {
      userId: req.session.userId,
      sessionId: sessionId,
      lastActivity: lastActivity.toISOString()
    });

    // Clear session
    req.session.destroy((err) => {
      if (err) {
        logger.error('Failed to destroy timed out session', err);
      }
    });

    return res.status(401).json({
      error: 'session_timeout',
      message: 'Your session has expired. Please log in again.'
    });
  }

  // Update last activity
  sessionLastActivity.set(sessionId, now);
  next();
}

/**
 * Enforce concurrent session limits
 */
export function enforceConcurrentSessions(req: SessionRequest, res: Response, next: NextFunction) {
  const userId = req.session?.userId;
  const sessionId = req.sessionID;

  if (!userId) {
    return next();
  }

  // Get or create user session set
  if (!userSessions.has(userId)) {
    userSessions.set(userId, new Set());
  }

  const userSessionSet = userSessions.get(userId)!;

  // Add current session
  userSessionSet.add(sessionId);

  // Check if exceeding concurrent session limit
  if (userSessionSet.size > MAX_CONCURRENT_SESSIONS) {
    logger.security('Concurrent session limit exceeded', 'warn' as any, {
      userId,
      sessionCount: userSessionSet.size,
      maxAllowed: MAX_CONCURRENT_SESSIONS
    });

    // Remove oldest session (first in set)
    const oldestSession = userSessionSet.values().next().value;
    userSessionSet.delete(oldestSession);
    sessionLastActivity.delete(oldestSession);
  }

  next();
}

/**
 * Clean up session data on logout
 */
export function cleanupSession(userId: number, sessionId: string) {
  const userSessionSet = userSessions.get(userId);
  if (userSessionSet) {
    userSessionSet.delete(sessionId);
    if (userSessionSet.size === 0) {
      userSessions.delete(userId);
    }
  }
  sessionLastActivity.delete(sessionId);
}

/**
 * Get active session count for user
 */
export function getActiveSessionCount(userId: number): number {
  const userSessionSet = userSessions.get(userId);
  return userSessionSet ? userSessionSet.size : 0;
}

/**
 * Force logout all sessions for user
 */
export function forceLogoutAllSessions(userId: number) {
  const userSessionSet = userSessions.get(userId);
  if (userSessionSet) {
    userSessionSet.forEach(sessionId => {
      sessionLastActivity.delete(sessionId);
    });
    userSessions.delete(userId);
  }
  
  logger.security('Force logout all sessions', 'info' as any, { userId });
}

/**
 * Session monitoring middleware
 */
export function sessionMonitoring(req: SessionRequest, res: Response, next: NextFunction) {
  const sessionId = req.sessionID;
  const userId = req.session?.userId;

  // Track session activity
  if (userId) {
    logger.auth('Session activity', userId, undefined, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  }

  // Add session info to response headers for debugging
  if (process.env.NODE_ENV !== 'production') {
    if (sessionId) {
      res.setHeader('X-Session-ID', sessionId);
    }
    res.setHeader('X-User-ID', userId || 'none');
    res.setHeader('X-Session-Count', userId ? getActiveSessionCount(userId).toString() : '0');
  }

  next();
}