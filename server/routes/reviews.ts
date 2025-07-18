import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../middleware/auth';

import { logger } from '../services/logger';
const router = Router();

// Get reviews for a company
router.get('/company/:companyId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Ensure user can only access their own company's reviews
    if (user.role !== 'super_admin' && user.companyId !== parseInt(companyId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const reviews = await storage.getReviewsByCompany(parseInt(companyId));
    res.json(reviews);
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Get review statistics for a company
router.get('/stats/:companyId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Ensure user can only access their own company's stats
    if (user.role !== 'super_admin' && user.companyId !== parseInt(companyId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const reviews = await storage.getReviewsByCompany(parseInt(companyId));
    
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    
    const ratingDistribution = [1, 2, 3, 4, 5].reduce((acc, rating) => {
      acc[rating] = reviews.filter((review: any) => review.rating === rating).length;
      return acc;
    }, {} as Record<number, number>);

    res.json({
      totalReviews,
      averageRating,
      ratingDistribution
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Failed to fetch review statistics' });
  }
});

export default router;