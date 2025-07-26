import { spawn } from "child_process";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  details?: Record<string, any>;
}

/**
 * Check if DevSpace CLI is available in the system PATH with timeout
 */
export async function validateDevSpaceInstallation(): Promise<ValidationResult> {
  try {
    const result = await new Promise<{ exitCode: number; output: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('DevSpace CLI check timed out after 10 seconds'));
      }, 10000);

      const child = spawn('devspace', ['version'], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        resolve({
          exitCode: code || 0,
          output: output.trim(),
        });
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          exitCode: 1,
          output: error.message,
        });
      });
    });

    if (result.exitCode === 0) {
      return {
        isValid: true,
        message: `DevSpace CLI is available`,
        details: { version: result.output },
      };
    } else {
      return {
        isValid: false,
        message: `DevSpace CLI check failed`,
        details: { 
          exitCode: result.exitCode, 
          output: result.output,
          suggestions: [
            'Install DevSpace CLI: https://devspace.sh/docs/getting-started/installation',
            'Verify DevSpace is in your PATH: devspace version',
            'Check if DevSpace binary has execute permissions'
          ]
        },
      };
    }
  } catch (error) {
    return {
      isValid: false,
      message: `DevSpace CLI validation error: ${error instanceof Error ? error.message : String(error)}`,
      details: {
        error: error instanceof Error ? error.name : 'Unknown',
        suggestions: [
          'Ensure DevSpace CLI is installed and accessible',
          'Check system PATH configuration',
          'Verify firewall/antivirus is not blocking the executable'
        ]
      }
    };
  }
}

/**
 * Validate working directory exists and is accessible with detailed checks
 */
export async function validateWorkingDirectory(workingDirectory?: string): Promise<ValidationResult> {
  if (!workingDirectory) {
    return { isValid: true, message: 'Using current working directory' };
  }

  try {
    const fs = await import('fs');
    const path = await import('path');
    
    // Resolve absolute path
    const absolutePath = path.resolve(workingDirectory);
    
    const stats = await fs.promises.stat(absolutePath);
    
    if (!stats.isDirectory()) {
      return {
        isValid: false,
        message: `Specified path is not a directory: ${workingDirectory}`,
        details: {
          path: absolutePath,
          type: stats.isFile() ? 'file' : 'unknown',
          suggestions: ['Specify a valid directory path', 'Create the directory if it doesn\'t exist']
        }
      };
    }

    // Check permissions
    try {
      await fs.promises.access(absolutePath, fs.constants.R_OK | fs.constants.X_OK);
    } catch (accessError) {
      return {
        isValid: false,
        message: `Directory is not accessible: ${workingDirectory}`,
        details: {
          path: absolutePath,
          error: accessError instanceof Error ? accessError.message : 'Access denied',
          suggestions: [
            'Check directory permissions',
            'Ensure you have read and execute permissions',
            'Try running with appropriate privileges'
          ]
        }
      };
    }
    
    return { 
      isValid: true, 
      message: `Working directory validated: ${absolutePath}`,
      details: { path: absolutePath }
    };
  } catch (error) {
    return {
      isValid: false,
      message: `Working directory validation failed: ${error instanceof Error ? error.message : String(error)}`,
      details: {
        path: workingDirectory,
        error: error instanceof Error ? error.name : 'Unknown',
        suggestions: [
          'Verify the path exists',
          'Check path syntax and permissions',
          'Ensure the directory is not corrupted'
        ]
      }
    };
  }
}

/**
 * Validate DevSpace project exists in the specified directory with enhanced checks
 */
export async function validateDevSpaceProject(workingDirectory?: string): Promise<ValidationResult> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const projectDir = workingDirectory || process.cwd();
    const devspaceYamlPath = path.join(projectDir, 'devspace.yaml');
    const devspaceYmlPath = path.join(projectDir, 'devspace.yml'); // Alternative extension
    
    let configPath: string | null = null;
    
    try {
      await fs.promises.access(devspaceYamlPath, fs.constants.F_OK);
      configPath = devspaceYamlPath;
    } catch {
      try {
        await fs.promises.access(devspaceYmlPath, fs.constants.F_OK);
        configPath = devspaceYmlPath;
      } catch {
        // Neither exists
      }
    }

    if (!configPath) {
      return {
        isValid: false,
        message: `No DevSpace configuration found in ${projectDir}`,
        details: {
          searchPaths: [devspaceYamlPath, devspaceYmlPath],
          suggestions: [
            'Initialize a DevSpace project first using devspace_init',
            'Ensure you are in the correct project directory',
            'Check if the configuration file was accidentally moved or deleted'
          ]
        }
      };
    }

    // Validate config file is readable and not empty
    try {
      const stats = await fs.promises.stat(configPath);
      if (stats.size === 0) {
        return {
          isValid: false,
          message: `DevSpace configuration file is empty: ${configPath}`,
          details: {
            configPath,
            suggestions: [
              'Reinitialize the project with devspace_init',
              'Restore from backup if available',
              'Check file permissions and disk space'
            ]
          }
        };
      }

      // Try to read the file to ensure it's accessible
      await fs.promises.readFile(configPath, 'utf8');
      
      return {
        isValid: true,
        message: `DevSpace project found`,
        details: { 
          configPath,
          configSize: stats.size,
          lastModified: stats.mtime
        },
      };
    } catch (readError) {
      return {
        isValid: false,
        message: `Cannot read DevSpace configuration: ${readError instanceof Error ? readError.message : 'Unknown error'}`,
        details: {
          configPath,
          error: readError instanceof Error ? readError.name : 'Unknown',
          suggestions: [
            'Check file permissions',
            'Ensure the file is not corrupted',
            'Try running with appropriate privileges'
          ]
        }
      };
    }
  } catch (error) {
    return {
      isValid: false,
      message: `Project validation error: ${error instanceof Error ? error.message : String(error)}`,
      details: {
        error: error instanceof Error ? error.name : 'Unknown',
        suggestions: [
          'Check if the directory exists and is accessible',
          'Verify file system permissions',
          'Ensure disk space is available'
        ]
      }
    };
  }
}

/**
 * Enhanced error formatting with context and actionable suggestions
 */
export function formatError(
  toolName: string,
  error: unknown,
  context?: Record<string, any>
): string {
  let errorMessage = '';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = String(error);
  }

  let formattedError = `❌ Error in ${toolName}: ${errorMessage}`;
  
  if (context && Object.keys(context).length > 0) {
    formattedError += '\n\n📋 Context:\n';
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'object' && value !== null) {
        formattedError += `  ${key}: ${JSON.stringify(value, null, 2)}\n`;
      } else {
        formattedError += `  ${key}: ${String(value)}\n`;
      }
    }
  }

  // Add specific troubleshooting suggestions based on error patterns
  const suggestions: string[] = [];

  if (errorMessage.includes('command not found') || errorMessage.includes('ENOENT')) {
    suggestions.push(
      '🔧 Install DevSpace CLI: https://devspace.sh/docs/getting-started/installation',
      '🔍 Verify DevSpace is in your PATH: `devspace version`',
      '⚙️ Check if DevSpace binary has execute permissions'
    );
  }

  if (errorMessage.includes('no such file or directory') && errorMessage.includes('devspace.yaml')) {
    suggestions.push(
      '🚀 Initialize a DevSpace project first: use devspace_init',
      '📂 Ensure you are in the correct project directory',
      '🔎 Check if devspace.yaml was moved or deleted'
    );
  }

  if (errorMessage.includes('denied') || errorMessage.includes('permission')) {
    suggestions.push(
      '☸️ Check Kubernetes cluster access: `kubectl cluster-info`',
      '🔐 Verify your kubeconfig is configured correctly',
      '👤 Ensure you have permissions in the target namespace',
      '🔑 Check file/directory permissions'
    );
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    suggestions.push(
      '⏱️ Command may need more time to complete',
      '🌐 Check network connectivity to Kubernetes cluster',
      '🔄 Try running the command again',
      '📊 Check cluster resource availability'
    );
  }

  if (errorMessage.includes('connection refused') || errorMessage.includes('network')) {
    suggestions.push(
      '🌐 Check network connectivity',
      '🔧 Verify Kubernetes cluster is running',
      '🚪 Check if required ports are open',
      '📱 Verify proxy/firewall settings'
    );
  }

  if (suggestions.length > 0) {
    formattedError += '\n\n💡 Troubleshooting Suggestions:\n';
    suggestions.forEach((suggestion) => {
      formattedError += `  ${suggestion}\n`;
    });
  }

  return formattedError;
}

/**
 * Commands that require a DevSpace project to exist
 */
export const PROJECT_REQUIRED_COMMANDS = [
  'devspace_dev',
  'devspace_deploy', 
  'devspace_build',
  'devspace_logs',
  'devspace_cleanup',
  'devspace_purge',
  'devspace_list',
  'devspace_enter',
  'devspace_sync',
  'devspace_open',
  'devspace_print',
  'devspace_run',
] as const;

/**
 * Commands that don't require a project (can be run anywhere)
 */
export const GLOBAL_COMMANDS = [
  'devspace_init',
  'devspace_version',
  'devspace_use',
  'devspace_reset',
  'devspace_set',
  'devspace_analyze',
  'devspace_ui',
  'devspace_add',
  'devspace_remove',
] as const;

/**
 * Validate if a command requires a DevSpace project and check accordingly
 */
export async function validateCommandRequirements(
  toolName: string,
  workingDirectory?: string
): Promise<ValidationResult> {
  // Always validate DevSpace CLI installation first
  const cliValidation = await validateDevSpaceInstallation();
  if (!cliValidation.isValid) {
    return cliValidation;
  }

  // Validate working directory if specified
  if (workingDirectory) {
    const dirValidation = await validateWorkingDirectory(workingDirectory);
    if (!dirValidation.isValid) {
      return dirValidation;
    }
  }

  // Check if project is required for this command
  if (PROJECT_REQUIRED_COMMANDS.includes(toolName as any)) {
    const projectValidation = await validateDevSpaceProject(workingDirectory);
    if (!projectValidation.isValid) {
      return projectValidation;
    }
  }

  return { 
    isValid: true, 
    message: `✅ All requirements validated for ${toolName}`,
    details: { 
      command: toolName,
      requiresProject: PROJECT_REQUIRED_COMMANDS.includes(toolName as any),
      workingDirectory: workingDirectory || process.cwd()
    }
  };
} 