import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { storage } from '../storage';
import { asyncHandler, successResponse, validationError } from '../middleware/error-handling';
import { logger } from '../services/logger';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const onboardingProgressSchema = z.object({
  completedSteps: z.array(z.string()).optional(),
  currentStep: z.string().optional(),
  hasSeenWalkthrough: z.boolean().optional(),
  skippedSteps: z.array(z.string()).optional(),
  lastActiveDate: z.string().optional(),
});

// Get user's onboarding progress
router.get('/progress', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  
  try {
    // Get user's onboarding progress from user preferences
    const userData = await storage.getUser(user.id);
    if (!userData) {
      return validationError('User not found');
    }

    const onboardingProgress = (userData.appearancePreferences as any)?.onboardingProgress || {
      completedSteps: [],
      currentStep: 'welcome',
      hasSeenWalkthrough: false,
      skippedSteps: [],
      lastActiveDate: new Date().toISOString()
    };

    logger.info('Retrieved onboarding progress', { 
      userId: user.id, 
      hasSeenWalkthrough: onboardingProgress.hasSeenWalkthrough,
      completedSteps: onboardingProgress.completedSteps?.length || 0
    });

    successResponse(res, onboardingProgress);
  } catch (error) {
    logger.error('Error retrieving onboarding progress', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id 
    });
    throw error;
  }
}));

// Update user's onboarding progress
router.post('/progress', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  
  try {
    const validatedData = onboardingProgressSchema.parse(req.body);
    
    // Get current user data
    const userData = await storage.getUser(user.id);
    if (!userData) {
      return validationError('User not found');
    }

    // Get current appearance preferences
    const currentPreferences = userData.appearancePreferences as any || {};
    const currentProgress = currentPreferences.onboardingProgress || {};

    // Merge with new progress data
    const updatedProgress = {
      ...currentProgress,
      ...validatedData,
      lastActiveDate: new Date().toISOString()
    };

    // Update user preferences with new onboarding progress
    const updatedPreferences = {
      ...currentPreferences,
      onboardingProgress: updatedProgress
    };

    await storage.updateUser(user.id, {
      appearancePreferences: updatedPreferences
    });

    logger.info('Updated onboarding progress', { 
      userId: user.id, 
      hasSeenWalkthrough: updatedProgress.hasSeenWalkthrough,
      completedSteps: updatedProgress.completedSteps?.length || 0,
      currentStep: updatedProgress.currentStep
    });

    successResponse(res, updatedProgress, 'Onboarding progress updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationError('Invalid onboarding progress data', error.errors);
    }
    
    logger.error('Error updating onboarding progress', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id 
    });
    throw error;
  }
}));

// Complete walkthrough - dedicated endpoint
router.post('/complete', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  
  try {
    // Get current user data
    const userData = await storage.getUser(user.id);
    if (!userData) {
      return validationError('User not found');
    }

    // Get current appearance preferences
    const currentPreferences = userData.appearancePreferences as any || {};
    const currentProgress = currentPreferences.onboardingProgress || {};

    // Mark walkthrough as completed
    const updatedProgress = {
      ...currentProgress,
      hasSeenWalkthrough: true,
      completedSteps: [...(currentProgress.completedSteps || []), 'completion'],
      currentStep: 'completed',
      lastActiveDate: new Date().toISOString()
    };

    // Update user preferences with completion status
    const updatedPreferences = {
      ...currentPreferences,
      onboardingProgress: updatedProgress
    };

    await storage.updateUser(user.id, {
      appearancePreferences: updatedPreferences
    });

    logger.info('Walkthrough completed', { 
      userId: user.id, 
      email: user.email,
      completedAt: new Date().toISOString()
    });

    successResponse(res, updatedProgress, 'Walkthrough completed successfully');
  } catch (error) {
    logger.error('Error completing walkthrough', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id 
    });
    throw error;
  }
}));

// Reset onboarding progress (admin only)
router.post('/reset', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  
  // Only allow company admins and super admins to reset
  if (user.role !== 'company_admin' && user.role !== 'super_admin') {
    return validationError('Insufficient permissions');
  }

  try {
    const { userId } = req.body;
    const targetUserId = userId || user.id;

    // Get current user data
    const userData = await storage.getUser(targetUserId);
    if (!userData) {
      return validationError('User not found');
    }

    // Reset onboarding progress
    const currentPreferences = userData.appearancePreferences as any || {};
    const resetProgress = {
      completedSteps: [],
      currentStep: 'welcome',
      hasSeenWalkthrough: false,
      skippedSteps: [],
      lastActiveDate: new Date().toISOString()
    };

    const updatedPreferences = {
      ...currentPreferences,
      onboardingProgress: resetProgress
    };

    await storage.updateUser(targetUserId, {
      appearancePreferences: updatedPreferences
    });

    logger.info('Reset onboarding progress', { 
      userId: user.id, 
      targetUserId,
      resetBy: user.email
    });

    successResponse(res, resetProgress, 'Onboarding progress reset successfully');
  } catch (error) {
    logger.error('Error resetting onboarding progress', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id 
    });
    throw error;
  }
}));

// Get onboarding analytics (super admin only)
router.get('/analytics', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  
  if (user.role !== 'super_admin') {
    return validationError('Insufficient permissions');
  }

  try {
    // Get all users with their onboarding progress
    const users = await storage.getAllUsers();
    
    const analytics = {
      totalUsers: users.length,
      completedWalkthroughs: 0,
      inProgressWalkthroughs: 0,
      notStartedWalkthroughs: 0,
      averageCompletionRate: 0,
      completionByRole: {
        company_admin: { success: true },
        technician: { success: true },
        sales_staff: { success: true }
      },
      commonSkippedSteps: {} as Record<string, number>
    };

    users.forEach(userData => {
      const preferences = userData.appearancePreferences as any;
      const progress = preferences?.onboardingProgress;
      
      if (progress?.hasSeenWalkthrough) {
        analytics.completedWalkthroughs++;
      } else if (progress?.completedSteps?.length > 0) {
        analytics.inProgressWalkthroughs++;
      } else {
        analytics.notStartedWalkthroughs++;
      }

      // Track by role
      if (userData.role && userData.role !== 'super_admin') {
        const roleStats = analytics.completionByRole[userData.role as keyof typeof analytics.completionByRole];
        if (roleStats) {
          roleStats.total++;
          if (progress?.hasSeenWalkthrough) {
            roleStats.completed++;
          }
        }
      }

      // Track skipped steps
      if (progress?.skippedSteps?.length > 0) {
        progress.skippedSteps.forEach((step: string) => {
          analytics.commonSkippedSteps[step] = (analytics.commonSkippedSteps[step] || 0) + 1;
        });
      }
    });

    analytics.averageCompletionRate = analytics.totalUsers > 0 
      ? (analytics.completedWalkthroughs / analytics.totalUsers) * 100 
      : 0;

    logger.info('Retrieved onboarding analytics', { 
      userId: user.id,
      totalUsers: analytics.totalUsers,
      completedWalkthroughs: analytics.completedWalkthroughs
    });

    successResponse(res, analytics);
  } catch (error) {
    logger.error('Error retrieving onboarding analytics', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id 
    });
    throw error;
  }
}));

export default router;