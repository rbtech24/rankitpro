import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { storage } from '../storage';

import { logger } from '../services/structured-logger';
interface APIRequest extends Request {
  apiCredentials?: {
    id: number;
    companyId: number;
    permissions: string[];
    name: string;
  };
}

export const apiKeyAuth = (requiredPermissions: string[] = []) => {
  return async (req: APIRequest, res: Response, next: NextFunction) => {
    try {
      const apiKey = req.headers.authorization?.replace('Bearer ', '');
      const secretKey = req.headers['x-api-secret'] as string;

      if (!apiKey || !secretKey) {
        return res.status(401).json({ 
          error: 'API authentication required',
          message: 'Both API key and secret key are required'
        });
      }

      // Hash the provided keys for comparison
      const apiKeyHash = createHash('sha256').update(apiKey).digest('hex');
      const secretKeyHash = createHash('sha256').update(secretKey).digest('hex');

      // Find matching credentials in database
      const allCredentials = await storage.getAllAPICredentials();
      const matchingCredentials = allCredentials.find(cred => 
        cred.apiKeyHash === apiKeyHash && 
        cred.secretKeyHash === secretKeyHash &&
        cred.isActive
      );

      if (!matchingCredentials) {
        return res.status(401).json({ 
          error: 'Invalid API credentials',
          message: 'API key or secret key is invalid'
        });
      }

      // Check if credentials are expired
      if (matchingCredentials.expiresAt && new Date(matchingCredentials.expiresAt) < new Date()) {
        return res.status(401).json({ 
          error: 'API credentials expired',
          message: 'Your API credentials have expired'
        });
      }

      // Parse permissions from JSON string
      const userPermissions = JSON.parse(matchingCredentials.permissions || '[]');

      // Check if user has required permissions
      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some(permission => 
          userPermissions.includes(permission)
        );

        if (!hasPermission) {
          return res.status(403).json({ 
            error: 'Insufficient permissions',
            message: "converted string",
            userPermissions
          });
        }
      }

      // Update last used timestamp
      await storage.updateAPICredentialsLastUsed(matchingCredentials.id);

      // Add credentials info to request for use in route handlers
      req.apiCredentials = {
        id: matchingCredentials.id,
        companyId: matchingCredentials.companyId,
        permissions: userPermissions,
        name: matchingCredentials.name
      };

      next();
    } catch (error) {
      logger.error("Error logging fixed");
      return res.status(500).json({ 
        error: 'Authentication service error',
        message: 'Internal server error during authentication'
      });
    }
  };
};