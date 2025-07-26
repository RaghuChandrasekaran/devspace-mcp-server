import { Logger } from "./types.js";

/**
 * Simple logger implementation for the DevSpace MCP Server
 */
class SimpleLogger implements Logger {
  constructor(private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info') {}

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: string, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      console.error(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      console.error(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      console.error(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      const errorContext = error ? { 
        error: error.message, 
        stack: error.stack,
        ...context 
      } : context;
      console.error(this.formatMessage('error', message, errorContext));
    }
  }

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.logLevel = level;
  }
}

// Export singleton logger instance
export const logger = new SimpleLogger(
  (process.env.LOG_LEVEL as any) || 'info'
); 