/**
 * Admin Rate Limiting Management Routes
 */

import { Router } from 'express';
import { rateLimitAdminRoutes } from '../../middleware/advanced-rate-limiting';
// Import auth middleware (we'll implement inline since it might not exist)
import { logger } from '../../services/structured-logger';

const router = Router();

// Apply authentication requirement
router.use((req, res, next) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({
      error: 'authentication_required',
      message: 'Please log in to access this endpoint'
    });
  }
  next();
});
// Only allow super admins
router.use((req, res, next) => {
  const user = (req as any).user;
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({
      error: 'insufficient_permissions',
      message: 'Super admin access required'
    });
  }
  next();
});

// Get current rate limiting configuration
router.get('/config', (req, res) => {
  try {
    const config = rateLimitAdminRoutes.getRateLimitTiers();
    res.json({
      success: true,
      config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get rate limiting config', { error: String(error) });
    res.status(500).json({
      error: 'failed_to_get_config',
      message: 'Unable to retrieve rate limiting configuration'
    });
  }
});

// Get blocked IPs
router.get('/blocked-ips', (req, res) => {
  try {
    const blockedIPs = rateLimitAdminRoutes.getBlockedIPs();
    res.json({
      success: true,
      blockedIPs,
      count: blockedIPs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get blocked IPs', { error: String(error) });
    res.status(500).json({
      error: 'failed_to_get_blocked_ips',
      message: 'Unable to retrieve blocked IP addresses'
    });
  }
});

// Get suspicious activities
router.get('/suspicious-activities', (req, res) => {
  try {
    const activities = rateLimitAdminRoutes.getSuspiciousActivities();
    
    // Sort by most recent and limit results
    const sortedActivities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100); // Return top 100 most recent

    res.json({
      success: true,
      activities: sortedActivities,
      count: sortedActivities.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get suspicious activities', { error: String(error) });
    res.status(500).json({
      error: 'failed_to_get_activities',
      message: 'Unable to retrieve suspicious activities'
    });
  }
});

// Block an IP address manually
router.post('/block-ip', (req, res) => {
  try {
    const { ip, reason = 'Manually blocked by admin' } = req.body;

    if (!ip) {
      return res.status(400).json({
        error: 'missing_ip',
        message: 'IP address is required'
      });
    }

    // Validate IP format (basic validation)
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({
        error: 'invalid_ip',
        message: 'Invalid IP address format'
      });
    }

    const blocked = rateLimitAdminRoutes.blockIP(ip, reason);

    if (blocked) {
      logger.info('IP address manually blocked by admin', { 
        ip, 
        reason,
        adminUserId: (req as any).user.id 
      });
      
      res.json({
        success: true,
        message: `IP address ${ip} has been blocked`,
        ip,
        reason,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(409).json({
        error: 'ip_already_blocked',
        message: `IP address ${ip} is already blocked`,
        ip
      });
    }
  } catch (error) {
    logger.error('Failed to block IP', { error: String(error), ip: req.body.ip });
    res.status(500).json({
      error: 'failed_to_block',
      message: 'Unable to block IP address'
    });
  }
});

// Unblock an IP address
router.post('/unblock-ip', (req, res) => {
  try {
    const { ip } = req.body;

    if (!ip) {
      return res.status(400).json({
        error: 'missing_ip',
        message: 'IP address is required'
      });
    }

    // Validate IP format (basic validation)
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({
        error: 'invalid_ip',
        message: 'Invalid IP address format'
      });
    }

    const unblocked = rateLimitAdminRoutes.unblockIP(ip);

    if (unblocked) {
      logger.info('IP address unblocked by admin', { 
        ip, 
        adminUserId: (req as any).user.id 
      });
      
      res.json({
        success: true,
        message: `IP address ${ip} has been unblocked`,
        ip,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        error: 'ip_not_blocked',
        message: `IP address ${ip} was not blocked`,
        ip
      });
    }
  } catch (error) {
    logger.error('Failed to unblock IP', { error: String(error), ip: req.body.ip });
    res.status(500).json({
      error: 'failed_to_unblock',
      message: 'Unable to unblock IP address'
    });
  }
});

// Get rate limiting statistics
router.get('/statistics', (req, res) => {
  try {
    const blockedIPs = rateLimitAdminRoutes.getBlockedIPs();
    const activities = rateLimitAdminRoutes.getSuspiciousActivities();
    const config = rateLimitAdminRoutes.getRateLimitTiers();

    // Calculate statistics
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(activity => activity.timestamp > last24Hours);

    // Group by IP for analysis
    const ipAnalysis = recentActivities.reduce((acc: any, activity) => {
      if (!acc[activity.ip]) {
        acc[activity.ip] = {
          ip: activity.ip,
          attempts: 0,
          endpoints: new Set(),
          userAgents: new Set()
        };
      }
      acc[activity.ip].attempts += activity.attempts;
      acc[activity.ip].endpoints.add(activity.endpoint);
      acc[activity.ip].userAgents.add(activity.userAgent);
      return acc;
    }, {});

    // Convert sets to arrays and sort by attempts
    const topOffenders = Object.values(ipAnalysis)
      .map((ip: any) => ({
        ...ip,
        endpoints: Array.from(ip.endpoints),
        userAgents: Array.from(ip.userAgents)
      }))
      .sort((a: any, b: any) => b.attempts - a.attempts)
      .slice(0, 10);

    res.json({
      success: true,
      statistics: {
        totalBlockedIPs: blockedIPs.length,
        totalSuspiciousActivities: activities.length,
        recentActivities24h: recentActivities.length,
        configuredTiers: config.length,
        topOffenders,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get rate limiting statistics', { error: String(error) });
    res.status(500).json({
      error: 'failed_to_get_statistics',
      message: 'Unable to retrieve rate limiting statistics'
    });
  }
});

export default router;