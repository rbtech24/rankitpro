/**
 * Trial Testing Routes (Development Only)
 * Provides endpoints to test trial expiration functionality
 */

import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { logger } from '../services/logger';

const router = Router();

// Only enable in development
const isDevelopment = process.env.NODE_ENV !== 'production';

// Test endpoint to expire a company's trial immediately
router.post('/expire/:companyId', async (req: Request, res: Response) => {
  if (!isDevelopment) {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }

    // Set trial end date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Expire the trial
    await storage.expireCompanyTrial(companyId);

    logger.info(`Trial expired for testing - Company: ${company.name} (ID: ${companyId})`);

    res.json({ 
      success: true,
      message: `Trial expired for company: ${company.name}`,
      companyId,
      trialEndDate: yesterday.toISOString(),
      testingNote: 'Trial has been expired for testing purposes'
    });

  } catch (error) {
    logger.error('Error expiring trial for testing', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      success: false,
      message: 'Failed to expire trial' 
    });
  }
});

// Test endpoint to set trial to expire in X days
router.post('/set-days/:companyId/:days', async (req: Request, res: Response) => {
  if (!isDevelopment) {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const companyId = parseInt(req.params.companyId);
    const days = parseInt(req.params.days);

    if (isNaN(companyId) || isNaN(days)) {
      return res.status(400).json({ message: 'Invalid company ID or days' });
    }

    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Calculate new trial end date
    const newTrialEndDate = new Date();
    newTrialEndDate.setDate(newTrialEndDate.getDate() + days);

    // Update company trial settings
    await storage.updateCompany(companyId, {
      trialEndDate: newTrialEndDate,
      isTrialActive: days > 0
    });

    logger.info(`Trial updated for testing - Company: ${company.name} (ID: ${companyId}), Days: ${days}`);

    res.json({
      success: true,
      message: `Trial set to ${days > 0 ? `expire in ${days} days` : 'expired'}`,
      companyId,
      companyName: company.name,
      trialEndDate: newTrialEndDate.toISOString(),
      daysLeft: days,
      isActive: days > 0
    });

  } catch (error) {
    logger.error('Error setting trial days for testing', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      success: false,
      message: 'Failed to set trial days' 
    });
  }
});

// Test endpoint to restore original trial period
router.post('/restore/:companyId', async (req: Request, res: Response) => {
  if (!isDevelopment) {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }

    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Restore to 14-day trial from today
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    await storage.updateCompany(companyId, {
      trialEndDate,
      isTrialActive: true
    });

    logger.info(`Trial restored for testing - Company: ${company.name} (ID: ${companyId})`);

    res.json({
      success: true,
      message: `Trial restored for company: ${company.name}`,
      companyId,
      trialEndDate: trialEndDate.toISOString(),
      daysLeft: 14,
      isActive: true
    });

  } catch (error) {
    logger.error('Error restoring trial for testing', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      success: false,
      message: 'Failed to restore trial' 
    });
  }
});

// Test endpoint to check trial status
router.get('/status/:companyId', async (req: Request, res: Response) => {
  if (!isDevelopment) {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const companyId = parseInt(req.params.companyId);
    if (isNaN(companyId)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }

    const company = await storage.getCompany(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const now = new Date();
    const trialEndDate = company.trialEndDate ? new Date(company.trialEndDate) : null;
    
    let daysLeft = 0;
    let expired = true;

    if (trialEndDate) {
      const timeDiff = trialEndDate.getTime() - now.getTime();
      daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      expired = daysLeft <= 0;
    }

    res.json({
      companyId,
      companyName: company.name,
      isTrialActive: company.isTrialActive,
      trialEndDate: trialEndDate?.toISOString(),
      daysLeft: Math.max(0, daysLeft),
      expired,
      hasSubscription: !!company.stripeSubscriptionId,
      plan: company.plan
    });

  } catch (error) {
    logger.error('Error checking trial status for testing', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      success: false,
      message: 'Failed to check trial status' 
    });
  }
});

// Test endpoint to list all companies with trial info
router.get('/companies', async (req: Request, res: Response) => {
  if (!isDevelopment) {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const companies = await storage.getAllCompanies();
    const now = new Date();

    const companiesWithTrialInfo = companies.map(company => {
      const trialEndDate = company.trialEndDate ? new Date(company.trialEndDate) : null;
      let daysLeft = 0;
      let expired = true;

      if (trialEndDate) {
        const timeDiff = trialEndDate.getTime() - now.getTime();
        daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        expired = daysLeft <= 0;
      }

      return {
        id: company.id,
        name: company.name,
        plan: company.plan,
        isTrialActive: company.isTrialActive,
        trialEndDate: trialEndDate?.toISOString(),
        daysLeft: Math.max(0, daysLeft),
        expired,
        hasSubscription: !!company.stripeSubscriptionId
      };
    });

    res.json({
      companies: companiesWithTrialInfo,
      totalCompanies: companies.length,
      activeTrials: companiesWithTrialInfo.filter(c => c.isTrialActive && !c.expired).length,
      expiredTrials: companiesWithTrialInfo.filter(c => c.expired && !c.hasSubscription).length,
      paidSubscriptions: companiesWithTrialInfo.filter(c => c.hasSubscription).length
    });

  } catch (error) {
    logger.error('Error listing companies for testing', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    res.status(500).json({ 
      success: false,
      message: 'Failed to list companies' 
    });
  }
});

export default router;