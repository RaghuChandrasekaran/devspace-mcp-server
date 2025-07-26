import { ServerConfig } from "./types.js";

/**
 * Default configuration for the DevSpace MCP Server
 */
export const defaultConfig: ServerConfig = {
  name: "devspace-mcp-server",
  version: "1.0.0",
  timeout: 300000, // 5 minutes
  maxRetries: 3,
  logLevel: (process.env.LOG_LEVEL as any) || 'info',
};

/**
 * Environment-specific configuration overrides
 */
export function getConfig(): ServerConfig {
  return {
    ...defaultConfig,
    timeout: parseInt(process.env.DEVSPACE_TIMEOUT || String(defaultConfig.timeout)),
    maxRetries: parseInt(process.env.DEVSPACE_MAX_RETRIES || String(defaultConfig.maxRetries)),
    logLevel: (process.env.LOG_LEVEL as any) || defaultConfig.logLevel,
  };
} 