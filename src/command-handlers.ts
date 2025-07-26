import { z } from "zod";
import { 
  DevSpaceInitSchema,
  DevSpaceDevSchema,
  DevSpaceDeploySchema,
  DevSpaceBuildSchema,
  DevSpaceLogsSchema,
  DevSpaceListSchema,
  DevSpaceEnterSchema,
  DevSpaceUseSchema,
  DevSpaceResetSchema,
  DevSpaceSetSchema,
  DevSpaceAnalyzeSchema,
  DevSpaceVersionSchema,
  DevSpaceUISchema,
  DevSpaceOpenSchema,
  DevSpacePrintSchema,
  DevSpaceRunSchema,
  DevSpaceAddSchema,
  DevSpaceRemoveSchema
} from "./schemas.js";
import { executeDevSpaceCommand, formatOutput, DevSpaceArgsBuilder } from "./command-executor.js";

// Using the MCP SDK's expected return type instead of custom interface

/**
 * Generic handler factory that reduces code duplication
 */
export function createCommandHandler<T extends z.ZodSchema>(
  schema: T,
  commandName: string,
  argsBuilder: (parsed: z.infer<T>) => string[]
) {
  return async (args: unknown) => {
    const parsed = schema.parse(args || {});
    const devspaceArgs = argsBuilder(parsed);
    
    const result = await executeDevSpaceCommand(
      commandName, 
      devspaceArgs, 
      parsed.workingDirectory
    );
    
    return {
      content: [{
        type: "text",
        text: `DevSpace ${commandName} Result:\n\n${formatOutput(result)}`
      }]
    };
  };
}

/**
 * Command handlers using the improved patterns
 */
export const commandHandlers = {
  devspace_init: createCommandHandler(
    DevSpaceInitSchema,
    'init',
    (parsed) => DevSpaceArgsBuilder.create()
      .addOption('--name', parsed.projectName)
      .addOption('--dockerfile', parsed.dockerfile)
      .build()
  ),

  devspace_dev: createCommandHandler(
    DevSpaceDevSchema,
    'dev',
    (parsed) => DevSpaceArgsBuilder.create()
      .addOption('--profile', parsed.profile)
      .addOption('--namespace', parsed.namespace)
      .addFlag('--terminal', parsed.terminal)
      .addBooleanOption('--sync', parsed.sync)
      .addBooleanOption('--portforwarding', parsed.portforwarding)
      .build()
  ),

  devspace_deploy: createCommandHandler(
    DevSpaceDeploySchema,
    'deploy',
    (parsed) => DevSpaceArgsBuilder.create()
      .addOption('--profile', parsed.profile)
      .addOption('--namespace', parsed.namespace)
      .addFlag('--force-build', parsed.forceBuild)
      .addFlag('--force-deploy', parsed.forceDeploy)
      .build()
  ),

  devspace_build: createCommandHandler(
    DevSpaceBuildSchema,
    'build',
    (parsed) => DevSpaceArgsBuilder.create()
      .addArray('--image', parsed.images)
      .addFlag('--force-build', parsed.forceBuild)
      .addFlag('--skip-push', parsed.skipPush)
      .build()
  ),

  devspace_logs: createCommandHandler(
    DevSpaceLogsSchema,
    'logs',
    (parsed) => DevSpaceArgsBuilder.create()
      .addOption('--container', parsed.container)
      .addFlag('--follow', parsed.follow)
      .addOption('--lines', parsed.lines)
      .build()
  ),

  devspace_list: createCommandHandler(
    DevSpaceListSchema,
    'list',
    (parsed) => [parsed.resource]
  ),

  devspace_enter: createCommandHandler(
    DevSpaceEnterSchema,
    'enter',
    (parsed) => DevSpaceArgsBuilder.create()
      .addOption('--container', parsed.container)
      .build()
  ),

  devspace_use: createCommandHandler(
    DevSpaceUseSchema,
    'use',
    (parsed) => DevSpaceArgsBuilder.create()
      .addFlag(parsed.type)
      .addOption('', parsed.name) // name goes directly after type
      .build()
  ),

  devspace_reset: createCommandHandler(
    DevSpaceResetSchema,
    'reset',
    (parsed) => [parsed.type]
  ),

  devspace_set: createCommandHandler(
    DevSpaceSetSchema,
    'set',
    (parsed) => [parsed.type, `${parsed.key}=${parsed.value}`]
  ),

  devspace_version: createCommandHandler(
    DevSpaceVersionSchema,
    'version',
    () => []
  ),

  devspace_analyze: createCommandHandler(
    DevSpaceAnalyzeSchema,
    'analyze',
    () => []
  ),

  devspace_ui: createCommandHandler(
    DevSpaceUISchema,
    'ui',
    (parsed) => DevSpaceArgsBuilder.create()
      .addOption('--port', parsed.port)
      .build()
  ),

  devspace_open: createCommandHandler(
    DevSpaceOpenSchema,
    'open',
    () => []
  ),

  devspace_print: createCommandHandler(
    DevSpacePrintSchema,
    'print',
    (parsed) => DevSpaceArgsBuilder.create()
      .addOption('--profile', parsed.profile)
      .build()
  ),

  devspace_run: createCommandHandler(
    DevSpaceRunSchema,
    'run',
    (parsed) => {
      const args = [parsed.command];
      if (parsed.args && parsed.args.length > 0) {
        args.push('--', ...parsed.args);
      }
      return args;
    }
  ),

  devspace_add: createCommandHandler(
    DevSpaceAddSchema,
    'add',
    (parsed) => [parsed.type, parsed.source]
  ),

  devspace_remove: createCommandHandler(
    DevSpaceRemoveSchema,
    'remove',
    (parsed) => [parsed.type, parsed.name]
  ),

  // Simple command handlers for commands that just need basic execution
  devspace_cleanup: async (args: unknown) => {
    const parsed = z.object({ workingDirectory: z.string().optional() }).parse(args || {});
    const result = await executeDevSpaceCommand('cleanup', [], parsed.workingDirectory);
    return {
      content: [{ type: "text", text: `DevSpace Cleanup Result:\n\n${formatOutput(result)}` }]
    };
  },

  devspace_purge: async (args: unknown) => {
    const parsed = z.object({ workingDirectory: z.string().optional() }).parse(args || {});
    const result = await executeDevSpaceCommand('purge', [], parsed.workingDirectory);
    return {
      content: [{ type: "text", text: `DevSpace Purge Result:\n\n${formatOutput(result)}` }]
    };
  },

  devspace_sync: async (args: unknown) => {
    const parsed = z.object({ workingDirectory: z.string().optional() }).parse(args || {});
    const result = await executeDevSpaceCommand('sync', [], parsed.workingDirectory);
    return {
      content: [{ type: "text", text: `DevSpace Sync Result:\n\n${formatOutput(result)}` }]
    };
  },
}; 