export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "devspace_init",
    description: "Initialize a new DevSpace project in the current directory or specified directory",
    inputSchema: {
      type: "object",
      properties: {
        projectName: {
          type: "string",
          description: "Name of the project to initialize",
        },
        dockerfile: {
          type: "string", 
          description: "Path to existing Dockerfile",
        },
        workingDirectory: {
          type: "string",
          description: "Directory to initialize DevSpace in (defaults to current directory)",
        },
      },
    },
  },
  {
    name: "devspace_dev",
    description: "Start DevSpace development mode - deploys the project and starts file sync, port forwarding, and log streaming",
    inputSchema: {
      type: "object",
      properties: {
        profile: {
          type: "string",
          description: "DevSpace profile to use (optional)",
        },
        namespace: {
          type: "string", 
          description: "Kubernetes namespace to use (optional)",
        },
        terminal: {
          type: "boolean",
          description: "Open terminal instead of showing logs",
        },
        sync: {
          type: "boolean",
          description: "Enable file synchronization (default: true)",
        },
        portforwarding: {
          type: "boolean", 
          description: "Enable port forwarding (default: true)",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_deploy", 
    description: "Deploy the DevSpace project to Kubernetes",
    inputSchema: {
      type: "object",
      properties: {
        profile: {
          type: "string",
          description: "DevSpace profile to use (optional)",
        },
        namespace: {
          type: "string",
          description: "Kubernetes namespace to use (optional)",
        },
        forceBuild: {
          type: "boolean",
          description: "Force rebuilding of images",
        },
        forceDeploy: {
          type: "boolean", 
          description: "Force redeployment",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_build",
    description: "Build Docker images defined in the DevSpace configuration",
    inputSchema: {
      type: "object",
      properties: {
        images: {
          type: "array",
          items: { type: "string" },
          description: "Specific images to build (optional)",
        },
        forceBuild: {
          type: "boolean",
          description: "Force rebuilding of images",
        },
        skipPush: {
          type: "boolean",
          description: "Skip pushing images to registry",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_logs",
    description: "Stream logs from containers deployed by DevSpace",
    inputSchema: {
      type: "object", 
      properties: {
        container: {
          type: "string",
          description: "Specific container to get logs from (optional)",
        },
        follow: {
          type: "boolean",
          description: "Follow log output continuously",
        },
        lines: {
          type: "number",
          description: "Number of lines to show",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_cleanup",
    description: "Clean up DevSpace deployments and resources",
    inputSchema: {
      type: "object",
      properties: {
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_purge",
    description: "Remove all DevSpace deployments from the cluster",
    inputSchema: {
      type: "object",
      properties: {
        workingDirectory: {
          type: "string", 
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_list",
    description: "List DevSpace resources (deployments, ports, profiles, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        resource: {
          type: "string",
          enum: ["deployments", "ports", "profiles", "vars", "contexts", "namespaces", "commands"],
          description: "Type of resource to list",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in", 
        },
      },
      required: ["resource"],
    },
  },
  {
    name: "devspace_enter",
    description: "Open an interactive terminal session to a container",
    inputSchema: {
      type: "object",
      properties: {
        container: {
          type: "string",
          description: "Container name or selector (optional)",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_sync",
    description: "Start file synchronization between local files and containers",
    inputSchema: {
      type: "object",
      properties: {
        workingDirectory: {
          type: "string", 
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_use",
    description: "Switch DevSpace context, namespace, or profile",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["context", "namespace", "profile"],
          description: "Type of resource to use",
        },
        name: {
          type: "string",
          description: "Name of the resource to use (optional - will prompt if not provided)",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
      required: ["type"],
    },
  },
  {
    name: "devspace_reset",
    description: "Reset DevSpace variables, dependencies, or pods",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["vars", "dependencies", "pods"],
          description: "Type of resource to reset",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
      required: ["type"],
    },
  },
  {
    name: "devspace_set",
    description: "Set DevSpace variables",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["var"],
          description: "Type of resource to set",
        },
        key: {
          type: "string",
          description: "Variable key to set",
        },
        value: {
          type: "string", 
          description: "Variable value to set",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
      required: ["type", "key", "value"],
    },
  },
  {
    name: "devspace_analyze",
    description: "Analyze the current DevSpace configuration and cluster",
    inputSchema: {
      type: "object",
      properties: {
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_version",
    description: "Show DevSpace version information",
    inputSchema: {
      type: "object",
      properties: {
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_ui",
    description: "Start the DevSpace localhost UI",
    inputSchema: {
      type: "object",
      properties: {
        port: {
          type: "number",
          description: "Port to run the UI on",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_open",
    description: "Open the current project in the browser",
    inputSchema: {
      type: "object",
      properties: {
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_print",
    description: "Print the DevSpace configuration",
    inputSchema: {
      type: "object",
      properties: {
        profile: {
          type: "string",
          description: "DevSpace profile to use",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
    },
  },
  {
    name: "devspace_run",
    description: "Run a custom command defined in devspace.yaml",
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Command name to run (from devspace.yaml)",
        },
        args: {
          type: "array",
          items: { type: "string" },
          description: "Additional arguments to pass to the command",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
      required: ["command"],
    },
  },
  {
    name: "devspace_add",
    description: "Add DevSpace plugins or other resources",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["plugin"],
          description: "Type of resource to add",
        },
        source: {
          type: "string",
          description: "Source URL or name of the resource to add",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
      required: ["type", "source"],
    },
  },
  {
    name: "devspace_remove", 
    description: "Remove DevSpace plugins or contexts",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["plugin", "context"],
          description: "Type of resource to remove",
        },
        name: {
          type: "string",
          description: "Name of the resource to remove",
        },
        workingDirectory: {
          type: "string",
          description: "Working directory to execute command in",
        },
      },
      required: ["type", "name"],
    },
  },
]; 