/**
 * Structured Logging Service for Rank It Pro
 * Replaces console.log statements with proper structured logging
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogContext {
  userId?: number;
  companyId?: number;
  endpoint?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class StructuredLogger {
  private isProduction = process.env.NODE_ENV === 'production';
  private logLevel: LogLevel;

  constructor() {
    // Set log level based on environment
    this.logLevel = this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex <= currentLevelIndex;
  }

  private createLogEntry(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeContext(context)
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isProduction ? undefined : error.stack
      };
    }

    return entry;
  }

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    // Remove sensitive information from logs
    const sanitized = { ...context };
    
    // Remove password fields
    if (sanitized.password) delete sanitized.password;
    if (sanitized.token) delete sanitized.token;
    if (sanitized.apiKey) delete sanitized.apiKey;
    if (sanitized.secretKey) delete sanitized.secretKey;
    
    // Truncate long values
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 500) {
        sanitized[key] = sanitized[key].substring(0, 500) + '...';
      }
    });

    return sanitized;
  }

  private output(entry: LogEntry): void {
    if (this.isProduction) {
      // In production, output JSON for log aggregation
      console.log(JSON.stringify(entry));
    } else {
      // In development, use colored console output
      const timestamp = entry.timestamp;
      const level = entry.level.toUpperCase().padEnd(5);
      const message = entry.message;
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
      const errorStr = entry.error ? ` ${entry.error.message}` : '';
      
      console.logger.info(`[${timestamp}] ${level} ${message}${contextStr}${errorStr}`);
      
      if (entry.error?.stack && !this.isProduction) {
        console.log(entry.error.stack);
      }
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(this.createLogEntry(LogLevel.ERROR, message, context, error));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(this.createLogEntry(LogLevel.WARN, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(this.createLogEntry(LogLevel.INFO, message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.output(this.createLogEntry(LogLevel.DEBUG, message, context));
    }
  }

  // Authentication specific logging
  authSuccess(message: string, userId: number, context?: LogContext): void {
    this.info(message, { ...context, userId, event: 'auth_success' });
  }

  authFailure(message: string, context?: LogContext): void {
    this.warn(message, { ...context, event: 'auth_failure' });
  }

  // Database specific logging
  dbQuery(message: string, context?: LogContext): void {
    this.debug(message, { ...context, event: 'db_query' });
  }

  dbError(message: string, error: Error, context?: LogContext): void {
    this.error(message, { ...context, event: 'db_error' }, error);
  }

  // API specific logging
  apiRequest(method: string, endpoint: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${endpoint}`, { ...context, method, endpoint, event: 'api_request' });
  }

  apiResponse(method: string, endpoint: string, statusCode: number, duration: number, context?: LogContext): void {
    this.info(`API Response: ${method} ${endpoint} - ${statusCode}`, { 
      ...context, 
      method, 
      endpoint, 
      statusCode, 
      duration,
      event: 'api_response' 
    });
  }

  // Security specific logging
  securityEvent(message: string, context?: LogContext): void {
    this.warn(message, { ...context, event: 'security' });
  }

  // Business logic logging
  businessEvent(message: string, context?: LogContext): void {
    this.info(message, { ...context, event: 'business' });
  }
}

// Export singleton instance
export const logger = new StructuredLogger();
export default logger;