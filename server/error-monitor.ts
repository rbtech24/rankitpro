/**
 * Enhanced Error Monitoring System for Rank It Pro
 * Provides comprehensive error tracking, alerting, and analytics
 */

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { logger } from './services/logger';
interface ErrorInfo {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'critical';
  message: string;
  stack?: string;
  url?: string;
  method?: string;
  userId?: number;
  userAgent?: string;
  ip?: string;
  context?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: string;
  count: number;
}

interface ErrorStats {
  totalErrors: number;
  criticalErrors: number;
  errorsByHour: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  errorsByType: Record<string, number>;
  lastError?: ErrorInfo;
}

class ErrorMonitor {
  private errors: Map<string, ErrorInfo> = new Map();
  private stats: ErrorStats = {
    totalErrors: 0,
    criticalErrors: 0,
    errorsByHour: {},
    errorsByEndpoint: {},
    errorsByType: {}
  };
  private logFile: string;
  private alertThresholds = {
    critical: 1,
    error: 5,
    hourlyLimit: 50
  };

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'error-monitor.json');
    this.ensureLogDirectory();
    this.loadExistingErrors();
    this.startCleanupInterval();
  }

  private ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private loadExistingErrors() {
    try {
      if (fs.existsSync(this.logFile)) {
        const data = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
        this.errors = new Map(data.errors || []);
        this.stats = data.stats || this.stats;
      }
    } catch (error) {
      logger.warn('Failed to load existing error logs:', { error });
    }
  }

  private saveErrors() {
    try {
      const data = {
        errors: Array.from(this.errors.entries()),
        stats: this.stats,
        lastSaved: new Date().toISOString()
      };
      fs.writeFileSync(this.logFile, JSON.stringify(data, null, 2));
    } catch (error) {
      logger.error("Unhandled error occurred");
    }
  }

  private generateErrorId(message: string, stack?: string): string {
    const hash = crypto.createHash('md5');
    hash.update(message + (stack?.split('\n')[0] || ''));
    return hash.digest('hex').substr(0, 8);
  }

  private updateStats(errorInfo: ErrorInfo) {
    this.stats.totalErrors++;
    if (errorInfo.level === 'critical') {
      this.stats.criticalErrors++;
    }

    const hour = new Date().getHours().toString();
    this.stats.errorsByHour[hour] = (this.stats.errorsByHour[hour] || 0) + 1;

    if (errorInfo.url) {
      this.stats.errorsByEndpoint[errorInfo.url] = (this.stats.errorsByEndpoint[errorInfo.url] || 0) + 1;
    }

    const errorType = this.categorizeError(errorInfo.message);
    this.stats.errorsByType[errorType] = (this.stats.errorsByType[errorType] || 0) + 1;

    this.stats.lastError = errorInfo;
  }

  private categorizeError(message: string): string {
    if (message.includes('database') || message.includes('sql') || message.includes('connection')) {
      return 'Database';
    }
    if (message.includes('auth') || message.includes('login') || message.includes('session')) {
      return 'Authentication';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'Validation';
    }
    if (message.includes('network') || message.includes('timeout') || message.includes('ENOTFOUND')) {
      return 'Network';
    }
    if (message.includes('permission') || message.includes('forbidden') || message.includes('unauthorized')) {
      return 'Authorization';
    }
    return 'General';
  }

  private shouldAlert(errorInfo: ErrorInfo): boolean {
    if (errorInfo.level === 'critical') {
      return errorInfo.count >= this.alertThresholds.critical;
    }
    if (errorInfo.level === 'error') {
      return errorInfo.count >= this.alertThresholds.error;
    }

    // Check hourly rate limit
    const currentHour = new Date().getHours().toString();
    const hourlyCount = this.stats.errorsByHour[currentHour] || 0;
    return hourlyCount >= this.alertThresholds.hourlyLimit;
  }

  private async sendAlert(errorInfo: ErrorInfo) {
    try {
      // Log critical alerts to console
      logger.error("Critical error alert", {
        id: errorInfo.id,
        message: errorInfo.message,
        count: errorInfo.count,
        timestamp: errorInfo.timestamp
      });

      // In production, this would integrate with external alerting services
      // like Slack, PagerDuty, or email notifications
      if (process.env.NODE_ENV === 'production') {
        // Example: await this.sendSlackAlert(errorInfo);
        // Example: await this.sendEmailAlert(errorInfo);
      }
    } catch (error) {
      logger.error("Unhandled error occurred");
    }
  }

  public logError(
    message: string,
    level: 'error' | 'warn' | 'info' | 'critical' = 'error',
    context?: {
      error?: Error;
      req?: Request;
      userId?: number;
      additionalContext?: Record<string, any>;
    }
  ) {
    const errorId = this.generateErrorId(message, context?.error?.stack);
    const timestamp = new Date().toISOString();

    let errorInfo: ErrorInfo;
    if (this.errors.has(errorId)) {
      errorInfo = this.errors.get(errorId)!;
      errorInfo.count++;
      errorInfo.timestamp = timestamp; // Update to latest occurrence
    } else {
      errorInfo = {
        id: errorId,
        timestamp,
        level,
        message,
        stack: context?.error?.stack,
        url: context?.req?.originalUrl,
        method: context?.req?.method,
        userId: context?.userId,
        userAgent: context?.req?.get('User-Agent'),
        ip: context?.req?.ip,
        context: context?.additionalContext,
        resolved: false,
        count: 1
      };
      this.errors.set(errorId, errorInfo);
    }

    this.updateStats(errorInfo);

    // Check if we should send an alert
    if (this.shouldAlert(errorInfo)) {
      this.sendAlert(errorInfo);
    }

    // Save to disk
    this.saveErrors();

    return errorId;
  }

  public getErrorStats(): ErrorStats {
    return { ...this.stats };
  }

  public getRecentErrors(limit = 50): ErrorInfo[] {
    return Array.from(this.errors.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  public getErrorById(id: string): ErrorInfo | undefined {
    return this.errors.get(id);
  }

  public markErrorResolved(id: string): boolean {
    const error = this.errors.get(id);
    if (error) {
      error.resolved = true;
      error.resolvedAt = new Date().toISOString();
      this.saveErrors();
      return true;
    }
    return false;
  }

  public getHealthReport(): {
    status: 'healthy' | 'warning' | 'critical';
    summary: string;
    stats: ErrorStats;
    recommendations: string[];
  } {
    const currentHour = new Date().getHours().toString();
    const hourlyErrors = this.stats.errorsByHour[currentHour] || 0;
    const criticalErrors = this.stats.criticalErrors;
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    let summary = 'System is operating normally';
    const recommendations: string[] = [];

    if (criticalErrors > 0) {
      status = 'critical';
      summary = `${criticalErrors} critical errors detected`;
      recommendations.push('Address critical errors immediately');
    } else if (hourlyErrors > this.alertThresholds.hourlyLimit / 2) {
      status = 'warning';
      summary = `${hourlyErrors} errors in the last hour`;
      recommendations.push('Monitor error patterns closely');
    }

    // Analyze error patterns
    const topErrorType = Object.entries(this.stats.errorsByType)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topErrorType && topErrorType[1] > 10) {
      recommendations.push(`Address frequent ${topErrorType[0]} errors`);
    }

    const topErrorEndpoint = Object.entries(this.stats.errorsByEndpoint)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topErrorEndpoint && topErrorEndpoint[1] > 5) {
      recommendations.push(`Investigate endpoint: ${topErrorEndpoint[0]}`);
    }

    return {
      status,
      summary,
      stats: this.stats,
      recommendations
    };
  }

  private startCleanupInterval() {
    // Clean up old resolved errors every 24 hours
    setInterval(() => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      for (const [id, error] of this.errors.entries()) {
        if (error.resolved && error.resolvedAt && 
            new Date(error.resolvedAt) < oneDayAgo) {
          this.errors.delete(id);
        }
      }
      
      this.saveErrors();
    }, 24 * 60 * 60 * 1000);
  }

  // Express middleware for automatic error capture
  public middleware() {
    return (error: any, req: Request, res: Response, next: NextFunction) => {
      const level = error.statusCode >= 500 ? 'error' : 'warn';
      
      this.logError(
        error.message || 'Unknown error',
        level,
        {
          error,
          req,
          userId: (req as any).session?.userId,
          additionalContext: {
            statusCode: error.statusCode,
            body: req.body
          }
        }
      );

      // Don't expose internal errors in production
      if (process.env.NODE_ENV === 'production') {
        res.status(error.statusCode || 500).json({
          message: error.statusCode < 500 ? error.message : 'Internal server error'
        });
      } else {
        res.status(error.statusCode || 500).json({
          message: error.message,
          stack: error.stack
        });
      }
    };
  }

  // API endpoints for error monitoring dashboard
  public setupRoutes(app: any) {
    // Get error statistics
    app.get('/api/admin/errors/stats', (req: Request, res: Response) => {
      res.json(this.getErrorStats());
    });

    // Get recent errors
    app.get('/api/admin/errors/recent', (req: Request, res: Response) => {
      const limit = parseInt(req.query.limit as string) || 50;
      res.json(this.getRecentErrors(limit));
    });

    // Get specific error details
    app.get('/api/admin/errors/:id', (req: Request, res: Response) => {
      const error = this.getErrorById(req.params.id);
      if (error) {
        res.json(error);
      } else {
        res.status(404).json({ message: 'Error not found' });
      }
    });

    // Mark error as resolved
    app.post('/api/admin/errors/:id/resolve', (req: Request, res: Response) => {
      const resolved = this.markErrorResolved(req.params.id);
      if (resolved) {
        res.json({ message: 'Error marked as resolved' });
      } else {
        res.status(404).json({ message: 'Error not found' });
      }
    });

    // Get health report
    app.get('/api/admin/health', (req: Request, res: Response) => {
      res.json(this.getHealthReport());
    });
  }
}

// Export singleton instance
export const errorMonitor = new ErrorMonitor();

// Helper function for manual error logging
export function logError(
  message: string,
  level: 'error' | 'warn' | 'info' | 'critical' = 'error',
  context?: any
) {
  return errorMonitor.logError(message, level, context);
}

export default errorMonitor;