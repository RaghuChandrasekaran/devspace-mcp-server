import { z } from "zod";

// Base command schema
export const DevSpaceCommandSchema = z.object({
  command: z.string().describe("The DevSpace command to execute"),
  args: z.array(z.string()).optional().describe("Additional arguments for the command"),
  workingDirectory: z.string().optional().describe("Working directory to execute the command in"),
});

// Core DevSpace command schemas
export const DevSpaceInitSchema = z.object({
  projectName: z.string().optional().describe("Name of the project to initialize"),
  dockerfile: z.string().optional().describe("Path to Dockerfile"),
  workingDirectory: z.string().optional().describe("Directory to initialize DevSpace in"),
});

export const DevSpaceDevSchema = z.object({
  profile: z.string().optional().describe("DevSpace profile to use"),
  namespace: z.string().optional().describe("Kubernetes namespace to use"),
  terminal: z.boolean().optional().describe("Open terminal instead of logs"),
  sync: z.boolean().optional().describe("Enable file synchronization"),
  portforwarding: z.boolean().optional().describe("Enable port forwarding"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceDeploySchema = z.object({
  profile: z.string().optional().describe("DevSpace profile to use"),
  namespace: z.string().optional().describe("Kubernetes namespace to use"),  
  forceBuild: z.boolean().optional().describe("Force rebuilding of images"),
  forceDeploy: z.boolean().optional().describe("Force redeployment"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceBuildSchema = z.object({
  images: z.array(z.string()).optional().describe("Specific images to build"),
  forceBuild: z.boolean().optional().describe("Force rebuilding of images"),
  skipPush: z.boolean().optional().describe("Skip pushing images to registry"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceLogsSchema = z.object({
  container: z.string().optional().describe("Specific container to get logs from"),
  follow: z.boolean().optional().describe("Follow log output"),
  lines: z.number().optional().describe("Number of lines to show"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

// Additional DevSpace utility command schemas
export const DevSpaceUseSchema = z.object({
  type: z.enum(['context', 'namespace', 'profile']).describe("Type of resource to use"),
  name: z.string().optional().describe("Name of the resource to use (optional - will prompt if not provided)"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceResetSchema = z.object({
  type: z.enum(['vars', 'dependencies', 'pods']).describe("Type of resource to reset"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceSetSchema = z.object({
  type: z.enum(['var']).describe("Type of resource to set"),
  key: z.string().describe("Variable key to set"),
  value: z.string().describe("Variable value to set"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceAnalyzeSchema = z.object({
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceVersionSchema = z.object({
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceUISchema = z.object({
  port: z.number().optional().describe("Port to run the UI on"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceOpenSchema = z.object({
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpacePrintSchema = z.object({
  profile: z.string().optional().describe("DevSpace profile to use"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceRunSchema = z.object({
  command: z.string().describe("Command name to run (from devspace.yaml)"),
  args: z.array(z.string()).optional().describe("Additional arguments to pass to the command"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceAddSchema = z.object({
  type: z.enum(['plugin']).describe("Type of resource to add"),
  source: z.string().describe("Source URL or name of the resource to add"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceRemoveSchema = z.object({
  type: z.enum(['plugin', 'context']).describe("Type of resource to remove"),
  name: z.string().describe("Name of the resource to remove"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceListSchema = z.object({
  resource: z.enum(['deployments', 'ports', 'profiles', 'vars', 'contexts', 'namespaces', 'commands']).describe("Type of resource to list"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
});

export const DevSpaceEnterSchema = z.object({
  container: z.string().optional().describe("Container name or selector (optional)"),
  workingDirectory: z.string().optional().describe("Working directory to execute command in"),
}); 