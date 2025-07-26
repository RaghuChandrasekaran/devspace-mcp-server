/**
 * Common types and interfaces for the DevSpace MCP Server
 */

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  details?: Record<string, any>;
}

export interface DevSpaceCommandOptions {
  timeout?: number;
  signal?: AbortSignal;
}

export interface ToolResponse {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Configuration interface for the DevSpace MCP Server
 */
export interface ServerConfig {
  name: string;
  version: string;
  timeout: number;
  maxRetries: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Base interface for all DevSpace command parameters
 */
export interface BaseDevSpaceCommand {
  workingDirectory?: string;
}

/**
 * Error types for better error handling
 */
export class DevSpaceError extends Error {
  constructor(
    message: string,
    public readonly command: string,
    public readonly exitCode?: number,
    public readonly stderr?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'DevSpaceError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Command execution context for better tracking and debugging
 */
export interface CommandContext {
  toolName: string;
  workingDirectory?: string;
  startTime: Date;
  requestId?: string;
}

/**
 * Logging interface for structured logging
 */
export interface Logger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
} 