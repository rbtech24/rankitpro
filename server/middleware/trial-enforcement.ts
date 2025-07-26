/**
 * Trial Enforcement Middleware
 * Blocks access when 14-day trial expires and no paid subscription exists
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { logError } from '../error-monitor';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    companyId?: number;
  };
}

export async function enforceTrialLimits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Skip trial enforcement for super admins and non-authenticated requests
  if (!req.user || req.user.role === 'super_admin') {
    return next();
  }

  // Skip for auth endpoints to allow login/logout
  if (req.path.startsWith('/api/auth/')) {
    return next();
  }

  // Allow access to billing endpoints for trial expired users to restore service
  if (req.path.startsWith('/api/billing/')) {
    return next();
  }

  // Allow access to trial status endpoint
  if (req.path === '/api/trial/status') {
    return next();
  }

  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(403).json({ 
        error: 'trial_expired',
        message: 'No company associated with user'
      });
    }

    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(403).json({ 
        error: 'trial_expired',
        message: 'Company not found'
      });
    }

    // If company has active paid subscription, allow access
    if (company.stripeSubscriptionId) {
      return next();
    }

    // Check if trial has expired
    if (!company.isTrialActive || !company.trialEndDate) {
      return res.status(403).json({
        error: 'trial_expired',
        message: 'Your 14-day free trial has expired. Please upgrade to continue using Rank It Pro.',
        trialExpired: true,
        upgradeRequired: true
      });
    }

    const now = new Date();
    const trialEndDate = new Date(company.trialEndDate);

    if (now > trialEndDate) {
      // Trial has expired - update database and block access
      await storage.expireCompanyTrial(companyId);
      
      return res.status(403).json({
        error: 'trial_expired',
        message: 'Your 14-day free trial has expired. Please upgrade to continue using Rank It Pro.',
        trialExpired: true,
        upgradeRequired: true,
        trialEndDate: trialEndDate.toISOString()
      });
    }

    // Trial is still active - add trial info to response headers
    const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    res.setHeader('X-Trial-Days-Left', daysLeft.toString());
    res.setHeader('X-Trial-End-Date', trialEndDate.toISOString());

    next();
  } catch (error) {
    // Log trial enforcement error to error monitoring system
    logError('Trial enforcement error', error);
    return res.status(500).json({ 
      error: 'system_error',
      message: 'Unable to verify trial status'
    });
  }
}

export async function getTrialStatus(companyId: number) {
  try {
    const company = await storage.getCompany(companyId);
    if (!company) {
      return { success: true };
    }

    // Has paid subscription
    if (company.stripeSubscriptionId) {
      return { success: true };
    }

    // No trial or trial inactive
    if (!company.isTrialActive || !company.trialEndDate) {
      return { success: true };
    }

    const now = new Date();
    const trialEndDate = new Date(company.trialEndDate);
    const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      expired: now > trialEndDate,
      daysLeft: Math.max(0, daysLeft),
      trialEndDate: trialEndDate.toISOString()
    };
  } catch (error) {
    // Log trial status error to error monitoring system
    logError('Error getting trial status', error);
    return { success: true };
  }
}