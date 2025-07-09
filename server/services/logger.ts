/**
 * Structured Logging Service for Rank It Pro
 * Provides centralized logging with proper levels and formatting
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  private logLevel: LogLevel = this.isProduction ? 'info' : 'debug';

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    let formatted = `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(entry.context)}`;
    }
    
    if (entry.error) {
      formatted += ` | Error: ${entry.error.message}`;
      if (!this.isProduction) {
        formatted += `\n${entry.error.stack}`;
      }
    }
    
    return formatted;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    };

    const formatted = this.formatMessage(entry);
    
    // In production, you might want to send to external logging service
    if (this.isProduction) {
      // Could integrate with services like Winston, Pino, or external logging
      console.log(formatted);
    } else {
      // Development logging with colors
      switch (level) {
        case 'debug':
          console.debug(formatted);
          break;
        case 'info':
          console.info(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'error':
          console.error(formatted);
          break;
      }
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  // Convenience methods for common use cases
  auth(message: string, context?: Record<string, any>): void {
    this.debug(`[AUTH] ${message}`, context);
  }

  database(message: string, context?: Record<string, any>): void {
    this.debug(`[DB] ${message}`, context);
  }

  api(message: string, context?: Record<string, any>): void {
    this.debug(`[API] ${message}`, context);
  }

  security(message: string, context?: Record<string, any>): void {
    this.warn(`[SECURITY] ${message}`, context);
  }
}

export const logger = new Logger();