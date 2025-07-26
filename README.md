# DevSpace MCP Server

A Model Context Protocol (MCP) server that enables AI assistants to interact with [DevSpace](https://devspace.sh/) - a developer tool for Kubernetes that lets you develop and deploy cloud-native software faster.

## ✨ Features

- **Complete DevSpace CLI Integration**: All major DevSpace commands available through MCP
- **Intelligent Error Handling**: Enhanced error messages with troubleshooting suggestions
- **Structured Logging**: Configurable logging with request tracking and performance monitoring
- **Modular Architecture**: Clean, maintainable codebase with separated concerns
- **Type Safety**: Full TypeScript support with comprehensive validation
- **Development Workflow**: File sync, port forwarding, log streaming, and more

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [DevSpace CLI](https://devspace.sh/docs/getting-started/installation) installed and in PATH
- Access to a Kubernetes cluster

### Installation

```bash
git clone <repository-url>
cd devspace-mcp
npm install
npm run build
```

## 🔧 Configuration

### Claude Desktop

Add to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "devspace": {
      "command": "node",
      "args": ["/path/to/devspace-mcp/dist/index.js"],
      "cwd": "~/",
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Cursor

Add to your Cursor settings (`Ctrl/Cmd + Shift + P` → "Preferences: Open Settings (JSON)"):

```json
{
  "mcp": {
    "servers": {
      "devspace": {
        "command": "node",
        "args": ["/path/to/devspace-mcp/dist/index.js"],
        "cwd": "~/",
        "env": {
          "LOG_LEVEL": "info",
          "DEVSPACE_TIMEOUT": "300000"
        }
      }
    }
  }
}
```

**Note**: The `cwd` can be set to any convenient directory (like your home directory `~/` or projects folder). Each DevSpace command accepts an optional `workingDirectory` parameter, allowing you to work with multiple projects without changing the MCP configuration.

### Environment Variables

- `LOG_LEVEL`: Set logging level (`debug`, `info`, `warn`, `error`)
- `DEVSPACE_TIMEOUT`: Command timeout in milliseconds (default: 300000)
- `DEVSPACE_MAX_RETRIES`: Maximum retry attempts (default: 3)

## 🛠️ Available Tools

### Core Development
- **`devspace_init`**: Initialize new DevSpace projects
- **`devspace_dev`**: Start development mode with file sync and port forwarding
- **`devspace_deploy`**: Deploy applications to Kubernetes
- **`devspace_build`**: Build and manage Docker images

### Monitoring & Debugging
- **`devspace_logs`**: Stream container logs with filtering
- **`devspace_enter`**: Open interactive terminal sessions
- **`devspace_analyze`**: Analyze configuration and cluster status

### Configuration Management
- **`devspace_list`**: List resources (deployments, profiles, etc.)
- **`devspace_use`**: Switch contexts, namespaces, or profiles
- **`devspace_set`** / **`devspace_reset`**: Manage variables and state
- **`devspace_print`**: Display current configuration

### Advanced Features
- **`devspace_run`**: Execute custom commands from `devspace.yaml`
- **`devspace_sync`**: Manual file synchronization
- **`devspace_ui`**: Launch DevSpace web UI
- **`devspace_add`** / **`devspace_remove`**: Plugin management
- **`devspace_cleanup`** / **`devspace_purge`**: Resource cleanup

## 📖 Example Usage

### Working with Multiple Projects
Since every tool supports a `workingDirectory` parameter, you can easily work with multiple DevSpace projects:

```
"Initialize a new DevSpace project in ~/projects/my-api"
"Deploy the project in ~/projects/frontend using the production profile"
"Start development mode for the project in /home/user/microservices/auth-service"
```

### Single Project Workflows
When working within one project, you can omit the `workingDirectory` if your MCP `cwd` is set correctly:

```
"Initialize a new DevSpace project for my Next.js app and deploy it to staging"
"Start DevSpace development mode with file sync enabled, then show me the logs from the web container"
```

### Configuration Management
```
"List all available DevSpace profiles and switch to the production profile"
"Show the current configuration for the project in ~/projects/backend"
```

### Troubleshooting
```
"Analyze my DevSpace configuration and show any issues with the current deployment"
"Check the logs for the web container in the project at /path/to/my/project"
```

## 🏗️ Architecture

The server is built with a modular architecture for maintainability:

```
src/
├── index.ts              # Main server setup and request handling
├── command-handlers.ts   # Business logic for each DevSpace command
├── command-executor.ts   # Command execution with timeout/abort support
├── schemas.ts           # Zod validation schemas
├── tool-definitions.ts  # MCP tool definitions
├── validation.ts        # Requirements and environment validation
├── logger.ts           # Structured logging system
├── config.ts           # Configuration management
└── types.ts            # TypeScript type definitions
```

## 🔧 Development

```bash
# Development mode with file watching
npm run dev:watch

# Type checking
npm run typecheck

# Build production version
npm run build

# Clean build artifacts
npm run clean
```

## 🛟 Troubleshooting

### DevSpace CLI Issues
```bash
# Check DevSpace installation
devspace version

# Verify Kubernetes access
kubectl cluster-info
```

### Common Solutions
- **Command timeout**: Increase `DEVSPACE_TIMEOUT` environment variable
- **Permission denied**: Check Kubernetes cluster permissions and namespace access
- **Port conflicts**: Use different ports in `devspace_ui` calls
- **File sync issues**: Ensure proper file permissions and disk space


## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [DevSpace Documentation](https://devspace.sh/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/desktop)
- [Cursor IDE](https://cursor.sh/)

---
