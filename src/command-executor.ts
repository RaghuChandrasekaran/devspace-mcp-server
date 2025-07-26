import { spawn } from "child_process";

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface DevSpaceCommandOptions {
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Execute DevSpace commands with better error handling and timeout support
 */
export async function executeDevSpaceCommand(
  command: string, 
  args: string[] = [], 
  workingDirectory?: string,
  options: DevSpaceCommandOptions = {}
): Promise<CommandResult> {
  const { timeout = 300000, signal } = options; // Default 5 minute timeout

  return new Promise((resolve, reject) => {
    const child = spawn('devspace', [command, ...args], {
      cwd: workingDirectory || process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      signal,
    });

    let stdout = '';
    let stderr = '';
    let timeoutId: NodeJS.Timeout | null = null;

    // Set up timeout
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);
    }

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code || 0,
      });
    });

    child.on('error', (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        stdout: '',
        stderr: error.message,
        exitCode: 1,
      });
    });

    // Handle abort signal
    if (signal) {
      signal.addEventListener('abort', () => {
        child.kill('SIGTERM');
        reject(new Error('Command was aborted'));
      });
    }
  });
}

/**
 * Format command output for better readability with enhanced formatting
 */
export function formatOutput(result: CommandResult): string {
  let output = '';
  
  if (result.exitCode === 0) {
    output += result.stdout;
    if (result.stderr) {
      output += '\n\n⚠️ Warnings/Info:\n' + result.stderr;
    }
  } else {
    output += `❌ Error (Exit Code: ${result.exitCode}):\n`;
    if (result.stderr) {
      output += result.stderr;
    }
    if (result.stdout) {
      output += '\n\n📄 Output:\n' + result.stdout;
    }
  }
  
  return output;
}

/**
 * Build DevSpace command arguments from parsed schema objects
 */
export class DevSpaceArgsBuilder {
  private args: string[] = [];

  static create(): DevSpaceArgsBuilder {
    return new DevSpaceArgsBuilder();
  }

  addFlag(flag: string, condition?: boolean): this {
    if (condition !== false) {
      this.args.push(flag);
    }
    return this;
  }

  addOption(flag: string, value?: string | number): this {
    if (value !== undefined && value !== null) {
      this.args.push(flag, String(value));
    }
    return this;
  }

  addBooleanOption(flag: string, value?: boolean): this {
    if (value === true) {
      this.args.push(flag);
    } else if (value === false) {
      this.args.push(`${flag}=false`);
    }
    return this;
  }

  addArray(flag: string, values?: string[]): this {
    if (values && values.length > 0) {
      this.args.push(flag, ...values);
    }
    return this;
  }

  build(): string[] {
    return [...this.args];
  }
} 