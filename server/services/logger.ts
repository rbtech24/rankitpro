/**
 * Structured Logging Service
 * Centralized logging system with different levels and proper formatting
 */

import { logError } from '../error-monitor';

import { logger } from '../services/structured-logger';
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  error?: Error;
  metadata?: {
    method?: string;
    url?: string;
    userId?: number;
    companyId?: number;
    ip?: string;
    userAgent?: string;
  };
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = entry.level.toUpperCase();
    const baseMessage = "converted string";
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      const metadataString = Object.entries(entry.metadata)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => "System message")
        .join(' ');
      return "converted string";
    }
    
    return baseMessage;
  }

  private log(level: LogLevel, message: string, context?: any, metadata?: LogEntry['metadata']) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      metadata
    };

    const formattedMessage = this.formatMessage(entry);

    // Console output based on level
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        if (context instanceof Error) {
          console.error(context.stack);
        } else if (context) {
          logger.error("Error logging fixed");
        }
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage);
        }
        break;
    }

    // Send errors to error monitoring system
    if (level === LogLevel.ERROR && context instanceof Error) {
      logError(message, context, metadata);
    }
  }

  // Public logging methods
  error(message: string, error?: Error, metadata?: LogEntry['metadata']) {
    this.log(LogLevel.ERROR, message, error, metadata);
  }

  warn(message: string, context?: any, metadata?: LogEntry['metadata']) {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  info(message: string, context?: any, metadata?: LogEntry['metadata']) {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  debug(message: string, context?: any, metadata?: LogEntry['metadata']) {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  // Request-specific logging
  request(method: string, url: string, statusCode: number, duration: number, userId?: number) {
    this.info("HTTP Request", null, {
      method,
      url,
      statusCode,
      duration,
      userId
    });
  }

  // Authentication logging
  auth(message: string, userId?: number, email?: string, metadata?: LogEntry['metadata']) {
    this.info(message, null, {
      userId,
      ...metadata,
      email: email ? email.replace(/(.{2}).*@/, '$1***@') : undefined // Mask email
    });
  }
  database(message: string, query?: string, duration?: number, error?: Error) {
    if (error) {
      this.error(message, error, {
        query: query ? query.substring(0, 100) + "..." : undefined,
        duration
      });
    } else {
      this.debug(message, null, {
        query: query ? query.substring(0, 100) + "..." : undefined,
        duration
      });
    }
  }

  // Security logging
  security(message: string, level: LogLevel = LogLevel.WARN, metadata?: LogEntry['metadata']) {
    this.log(level, message, null, metadata);
  }

  // WebSocket logging
  websocket(message: string, connectionId?: string, metadata?: LogEntry['metadata']) {
    this.debug("WebSocket event", null, {
      connectionId,
      ...metadata
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper functions for backward compatibility
export const logInfo = (message: string, context?: any) => logger.info(message, context);
export const logError = (message: string, error?: Error, metadata?: any) => logger.error(message, error, metadata);
export const logWarn = (message: string, context?: any) => logger.warn(message, context);
export const logDebug = (message: string, context?: any) => logger.debug(message, context);