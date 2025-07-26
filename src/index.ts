#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import our modular components
import { toolDefinitions } from "./tool-definitions.js";
import { commandHandlers } from "./command-handlers.js";
import { validateCommandRequirements, formatError } from "./validation.js";
import { logger } from "./logger.js";
import { getConfig } from "./config.js";
import { DevSpaceError, ValidationError } from "./types.js";

// Get server configuration
const config = getConfig();

// Initialize the MCP server
const server = new Server(
  {
    name: config.name,
    version: config.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Configure logger
logger.info("Starting DevSpace MCP Server", { 
  version: config.version,
  logLevel: config.logLevel,
  timeout: config.timeout 
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug("Listing available tools", { toolCount: toolDefinitions.length });
  
  return {
    tools: toolDefinitions,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();
  
  logger.info("Received tool call", { 
    toolName: name, 
    hasArgs: !!args,
    requestId: Math.random().toString(36).substr(2, 9)
  });

  try {
    // Extract working directory from args for validation
    const workingDirectory = args && typeof args === 'object' && 'workingDirectory' in args 
      ? args.workingDirectory as string | undefined 
      : undefined;

    // Validate command requirements
    const validation = await validateCommandRequirements(name, workingDirectory);
    if (!validation.isValid) {
      logger.warn("Validation failed", { 
        toolName: name, 
        message: validation.message,
        details: validation.details 
      });
      
      return {
        content: [
          {
            type: "text",
            text: formatError(name, new ValidationError(validation.message || 'Validation failed', validation.details), { args })
          }
        ],
        isError: true,
      };
    }

    // Find and execute the appropriate command handler
    const handler = commandHandlers[name as keyof typeof commandHandlers];
    if (!handler) {
      const error = new Error(`Unknown tool: ${name}`);
      logger.error("Unknown tool requested", error, { toolName: name });
      
      return {
        content: [
          {
            type: "text",
            text: formatError(name, error, { args, availableTools: Object.keys(commandHandlers) })
          }
        ],
        isError: true,
      };
    }

    // Execute the command handler
    logger.debug("Executing command handler", { toolName: name });
    const result = await handler(args);
    
    const duration = Date.now() - startTime;
     logger.info("Tool call completed", { 
       toolName: name, 
       duration: `${duration}ms`,
       success: true
     });

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Tool call failed", error as Error, { 
      toolName: name, 
      duration: `${duration}ms`,
      args: args ? JSON.stringify(args, null, 2) : undefined
    });

    // Handle different error types
    let formattedError: string;
    if (error instanceof DevSpaceError) {
      formattedError = formatError(name, error, {
        command: error.command,
        exitCode: error.exitCode,
        stderr: error.stderr,
        args
      });
    } else if (error instanceof ValidationError) {
      formattedError = formatError(name, error, {
        details: error.details,
        args
      });
    } else {
      formattedError = formatError(name, error, { args });
    }

    return {
      content: [
        {
          type: "text",
          text: formattedError
        }
      ],
      isError: true,
    };
  }
});

async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    logger.info("DevSpace MCP server running on stdio", {
      availableCommands: Object.keys(commandHandlers).length,
      config: {
        timeout: config.timeout,
        maxRetries: config.maxRetries,
        logLevel: config.logLevel
      }
    });
    
    // Log to stderr so it doesn't interfere with MCP protocol
    console.error("DevSpace MCP server running on stdio");
  } catch (error) {
    logger.error("Failed to start server", error as Error);
    console.error("Fatal error starting DevSpace MCP server:", error);
    process.exit(1);
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  logger.info("Received SIGINT, shutting down gracefully");
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info("Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error("Uncaught exception", error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error("Unhandled rejection", new Error(String(reason)), { promise });
  process.exit(1);
});

main().catch((error) => {
  logger.error("Fatal error in main()", error);
  console.error("Fatal error in main():", error);
  process.exit(1);
}); 