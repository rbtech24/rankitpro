/**
 * Live Security Monitoring Dashboard
 * Real-time monitoring of authentication events, failed login attempts, and suspicious activities
 */

import { EventEmitter } from 'events';
import { WebSocket } from 'ws';

import { logger } from './services/logger';
interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'suspicious_activity' | 'session_timeout' | 'multiple_sessions' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: number;
  email?: string;
  ip: string;
  userAgent?: string;
  location?: string;
  details: Record<string, any>;
  resolved: boolean;
  alertSent: boolean;
}

interface SecurityMetrics {
  totalEvents: number;
  loginAttempts: number;
  failedLogins: number;
  successfulLogins: number;
  suspiciousActivities: number;
  blockedIPs: number;
  activeSessions: number;
  lastEvent?: SecurityEvent;
}

interface ThreatPattern {
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

class SecurityMonitor extends EventEmitter {
  private events: Map<string, SecurityEvent> = new Map();
  private metrics: SecurityMetrics = {
    totalEvents: 0,
    loginAttempts: 0,
    failedLogins: 0,
    successfulLogins: 0,
    suspiciousActivities: 0,
    blockedIPs: 0,
    activeSessions: 0
  };
  private blockedIPs: Set<string> = new Set();
  private loginAttempts: Map<string, { success: true }> = new Map();
  private activeSessions: Map<string, { success: true }> = new Map();
  private connectedClients: Set<WebSocket> = new Set();
  
  // Threat patterns for suspicious activity detection
  private threatPatterns: ThreatPattern[] = [
    {
      name: 'SQL Injection',
      pattern: /('|(\\')|(;)|(\\)|(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b))/i,
      severity: 'high',
      description: 'Potential SQL injection attempt detected'
    },
    {
      name: 'XSS Attack',
      pattern: /(<script|javascript:|onload=|onerror=|onclick=|onmouseover=)/i,
      severity: 'high',
      description: 'Potential XSS attack detected'
    },
    {
      name: 'Directory Traversal',
      pattern: /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c)/i,
      severity: 'medium',
      description: 'Directory traversal attempt detected'
    },
    {
      name: 'Command Injection',
      pattern: /(\||\$\(|`|;|&&|\|\|)/,
      severity: 'high',
      description: 'Command injection attempt detected'
    },
    {
      name: 'CSRF Token Missing',
      pattern: /POST|PUT|DELETE/i,
      severity: 'medium',
      description: 'State-changing request without CSRF protection'
    }
  ];

  constructor() {
    super();
    this.startCleanupInterval();
    this.startMetricsUpdate();
  }

  // Add WebSocket client for real-time updates
  addClient(ws: WebSocket) {
    this.connectedClients.add(ws);
    ws.on('close', () => {
      this.connectedClients.delete(ws);
    });
    
    // Send current metrics to new client
    this.sendToClient(ws, {
      type: 'metrics',
      data: this.getMetrics()
    });
  }

  // Log security event
  logEvent(eventData: Partial<SecurityEvent> & { success: true }) {
    const event: SecurityEvent = {
      id: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`,
      timestamp: new Date().toISOString(),
      severity: eventData.severity || 'medium',
      resolved: false,
      alertSent: false,
      details: {},
      ...eventData
    };

    this.events.set(event.id, event);
    this.updateMetrics(event);
    
    // Only check for threats on non-suspicious events to prevent infinite recursion
    if (event.type !== 'suspicious_activity') {
      this.checkForThreats(event);
    }
    
    this.broadcastEvent(event);
    
    // Handle specific event types
    switch (event.type) {
      case 'login_failure':
        this.handleFailedLogin(event);
        break;
      case 'login_success':
        this.handleSuccessfulLogin(event);
        break;
      case 'suspicious_activity':
        this.handleSuspiciousActivity(event);
        break;
    }

    this.emit('security_event', event);
  }

  // Handle failed login attempts
  private handleFailedLogin(event: SecurityEvent) {
    const ip = event.ip;
    const attempts = this.loginAttempts.get(ip) || { success: true };
    
    attempts.count++;
    attempts.lastAttempt = Date.now();
    this.loginAttempts.set(ip, attempts);

    // Block IP after 10 failed attempts in 15 minutes (increased for development)
    if (attempts.count >= 10) {
      this.blockedIPs.add(ip);
      this.metrics.blockedIPs = this.blockedIPs.size;
      
      // Create suspicious activity event manually to avoid recursion
      const suspiciousEvent: SecurityEvent = {
        id: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`,
        timestamp: new Date().toISOString(),
        type: 'suspicious_activity',
        severity: 'high',
        ip: ip,
        resolved: false,
        alertSent: false,
        details: {
          reason: 'Multiple failed login attempts',
          attemptCount: attempts.count,
          blocked: true
        }
      };
      this.events.set(suspiciousEvent.id, suspiciousEvent);
      this.updateMetrics(suspiciousEvent);
      this.broadcastEvent(suspiciousEvent);
    }
  }

  // Handle successful login
  private handleSuccessfulLogin(event: SecurityEvent) {
    if (event.userId) {
      // Check for multiple concurrent sessions
      const existingSessions = Array.from(this.activeSessions.values())
        .filter(session => session.userId === event.userId);
      
      if (existingSessions.length > 0) {
        // Create multiple sessions event manually to avoid recursion
        const multiSessionEvent: SecurityEvent = {
          id: `<${closing}${tagName}${safeAttributes ? " " + safeAttributes : ""}>`,
          timestamp: new Date().toISOString(),
          type: 'multiple_sessions',
          severity: 'medium',
          ip: event.ip,
          userId: event.userId,
          resolved: false,
          alertSent: false,
          details: {
            reason: 'Multiple concurrent sessions detected',
            sessionCount: existingSessions.length + 1
          }
        };
        this.events.set(multiSessionEvent.id, multiSessionEvent);
        this.updateMetrics(multiSessionEvent);
        this.broadcastEvent(multiSessionEvent);
      }
    }
    
    // Reset failed attempts for this IP
    this.loginAttempts.delete(event.ip);
  }

  // Handle suspicious activity
  private handleSuspiciousActivity(event: SecurityEvent) {
    if (event.severity === 'critical' || event.severity === 'high') {
      // Auto-block IP for critical threats
      this.blockedIPs.add(event.ip);
      this.metrics.blockedIPs = this.blockedIPs.size;
    }
  }

  // Check for threat patterns
  private checkForThreats(event: SecurityEvent) {
    const requestData = JSON.stringify(event.details);
    
    for (const pattern of this.threatPatterns) {
      if (pattern.pattern.test(requestData)) {
        this.logEvent({
          type: 'suspicious_activity',
          ip: event.ip,
          severity: pattern.severity,
          details: {
            threatType: pattern.name,
            description: pattern.description,
            originalEvent: event.id,
            detectedPattern: pattern.pattern.source
          }
        });
      }
    }
  }

  // Track active sessions
  trackSession(sessionId: string, userId: number) {
    this.activeSessions.set(sessionId, {
      userId,
      startTime: Date.now(),
      lastActivity: Date.now()
    });
    this.metrics.activeSessions = this.activeSessions.size;
  }

  // Update session activity
  updateSessionActivity(sessionId: string) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  // Remove session
  removeSession(sessionId: string) {
    this.activeSessions.delete(sessionId);
    this.metrics.activeSessions = this.activeSessions.size;
  }

  // Check for session timeouts
  checkSessionTimeouts() {
    const now = Date.now();
    const timeout = 4 * 60 * 60 * 1000; // 4 hours
    
    for (const [sessionId, session] of this.activeSessions) {
      if (now - session.lastActivity > timeout) {
        this.logEvent({
          type: 'session_timeout',
          ip: 'system',
          userId: session.userId,
          severity: 'low',
          details: {
            sessionId,
            duration: now - session.startTime,
            lastActivity: session.lastActivity
          }
        });
        
        this.removeSession(sessionId);
      }
    }
  }

  // Update metrics
  private updateMetrics(event: SecurityEvent) {
    this.metrics.totalEvents++;
    
    switch (event.type) {
      case 'login_attempt':
        this.metrics.loginAttempts++;
        break;
      case 'login_failure':
        this.metrics.failedLogins++;
        break;
      case 'login_success':
        this.metrics.successfulLogins++;
        break;
      case 'suspicious_activity':
        this.metrics.suspiciousActivities++;
        break;
    }
    
    this.metrics.lastEvent = event;
  }

  // Broadcast event to all connected clients
  private broadcastEvent(event: SecurityEvent) {
    const message = {
      type: 'security_event',
      data: event
    };
    
    this.connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  // Send message to specific client
  private sendToClient(client: WebSocket, message: any) {
    try {
      client.send(JSON.stringify(message));
    } catch (error) {
      logger.error("Unhandled error occurred");
    }
  }

  // Get current metrics
  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  // Get recent events
  getRecentEvents(limit = 50): SecurityEvent[] {
    return Array.from(this.events.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Get events by type
  getEventsByType(type: SecurityEvent['type'], limit = 20): SecurityEvent[] {
    return Array.from(this.events.values())
      .filter(event => event.type === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Check if IP is blocked
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // Unblock IP
  unblockIP(ip: string): boolean {
    const wasBlocked = this.blockedIPs.delete(ip);
    if (wasBlocked) {
      this.metrics.blockedIPs = this.blockedIPs.size;
      this.loginAttempts.delete(ip);
    }
    return wasBlocked;
  }

  // Get blocked IPs
  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  // Resolve security event
  resolveEvent(eventId: string): boolean {
    const event = this.events.get(eventId);
    if (event) {
      event.resolved = true;
      return true;
    }
    return false;
  }

  // Start cleanup interval
  private startCleanupInterval() {
    setInterval(() => {
      this.checkSessionTimeouts();
      this.cleanupOldEvents();
    }, 60000); // Check every minute
  }

  // Start metrics update interval
  private startMetricsUpdate() {
    setInterval(() => {
      this.broadcastMetrics();
    }, 5000); // Update every 5 seconds
  }

  // Broadcast current metrics
  private broadcastMetrics() {
    const message = {
      type: 'metrics_update',
      data: this.getMetrics()
    };
    
    this.connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  // Clean up old events (keep last 1000 events)
  private cleanupOldEvents() {
    const events = Array.from(this.events.entries())
      .sort((a, b) => new Date(b[1].timestamp).getTime() - new Date(a[1].timestamp).getTime());
    
    if (events.length > 1000) {
      const toRemove = events.slice(1000);
      toRemove.forEach(([id]) => {
        this.events.delete(id);
      });
    }
  }

  // Get security health report
  getHealthReport() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentEvents = Array.from(this.events.values())
      .filter(event => new Date(event.timestamp).getTime() > oneHourAgo);
    
    const criticalEvents = recentEvents.filter(event => event.severity === 'critical');
    const highEvents = recentEvents.filter(event => event.severity === 'high');
    
    return {
      status: criticalEvents.length > 0 ? 'critical' : 
              highEvents.length > 5 ? 'warning' : 'healthy',
      metrics: this.getMetrics(),
      recentEvents: recentEvents.length,
      criticalEvents: criticalEvents.length,
      highPriorityEvents: highEvents.length,
      blockedIPs: this.blockedIPs.size,
      activeSessions: this.activeSessions.size
    };
  }
}

// Create global security monitor instance
export const securityMonitor = new SecurityMonitor();

// Middleware to monitor requests
export function securityMonitoringMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    
    // Only log actual login attempts, not all requests
    if (req.path === '/api/auth/login' && req.method === 'POST') {
      securityMonitor.logEvent({
        type: 'login_attempt',
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        severity: 'low',
        details: {
          method: req.method,
          path: req.path,
          userAgent: req.get('User-Agent'),
          referer: req.get('Referer')
        }
      });
    }
    
    // Temporarily disable IP blocking for testing - allow all requests
    // TODO: Re-enable after testing dual-app architecture
    /*
    if (req.path.startsWith('/api/') && 
        !req.path.startsWith('/api/security/monitor/clear-blocked-ips') && 
        !req.path.startsWith('/api/security/monitor/unblock-ip') &&
        securityMonitor.isIPBlocked(req.ip)) {
      return res.status(403).json({
        error: 'IP address blocked due to suspicious activity'
      });
    }
    */
    
    // Update session activity if authenticated
    if (req.session?.userId) {
      securityMonitor.updateSessionActivity(req.sessionID);
    }
    
    // Monitor response
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      if (req.path.includes('/api/auth/login')) {
        if (res.statusCode === 200) {
          securityMonitor.logEvent({
            type: 'login_success',
            ip: req.ip || req.connection.remoteAddress || 'unknown',
            userId: req.session?.userId,
            email: req.body?.email,
            severity: 'low',
            details: {
              duration,
              userAgent: req.get('User-Agent')
            }
          });
        } else if (res.statusCode === 401) {
          securityMonitor.logEvent({
            type: 'login_failure',
            ip: req.ip || req.connection.remoteAddress || 'unknown',
            email: req.body?.email,
            severity: 'medium',
            details: {
              duration,
              userAgent: req.get('User-Agent'),
              reason: 'Invalid credentials'
            }
          });
        }
      }
    });
    
    next();
  };
}