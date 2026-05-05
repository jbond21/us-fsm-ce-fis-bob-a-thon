# Lab 2: Bob Advanced Features
**Duration:** 45 minutes  
**Objective:** Explore BobShell, MCP, and custom modes

**Prerequisites:**
- Completed Lab 1
- Bob application running

> 📌 Two helpful links are the [Bob documentation](https://bob.ibm.com/docs/ide) from the last intro lab and the [BobShell specific documentation site](https://bob.ibm.com/docs/shell)

---

## Table of Contents
1. [Start Here](#overview)
2. [BobShell Basics](#bobshell-basics)
3. [BobShell Best Practices](#bobshell-best-practices)
4. [MCP Basics](#introduction-to-mcp)
5. [Custom Modes](#custom-modes)
6. [Managing Custom Modes](#using-and-managing-custom-modes)
7. [Troubleshooting](#troubleshooting)
8. [Key Takeaways](#key-takeaways)

---

## Overview

This lab introduces three of Bob’s most powerful advanced capabilities:

- **BobShell** for command-line workflows
- **MCP integrations** for connecting Bob to external tools and services
- **Custom modes** for tailoring Bob to specific workflows

### Learning Objectives

By the end of this lab, you will be able to:

- ✅ Use BobShell in interactive and non-interactive ways
- ✅ Understand how MCP extends Bob with external tools
- ✅ Understand what custom modes are and why they matter
- ✅ Create, install, and manage custom modes

---
## BobShell Basics

> **🧠 Bob Differentiator: Intelligent Resource Optimization**
> BobShell leverages Bob's automatic model selection to optimize every command. Simple tasks like code formatting use lighter models for speed, while complex analysis uses frontier-class models for accuracy. This happens automatically in the background, reducing costs by up to 60% while maintaining quality.

### What is BobShell?

BobShell is Bob's command-line interface that provides:

- **Interactive Mode**: Chat with Bob directly from the terminal
- **Non-Interactive Mode**: Execute single commands for automation
- **Script Integration**: Use Bob in shell scripts and automation workflows
- **CI/CD Integration**: Incorporate Bob into build and deployment pipelines
- **Batch Processing**: Process multiple files or tasks in sequence

### Step 1: Install and Verify BobShell

👉 **[BobShell Installation Guide](https://bob.ibm.com/docs/shell/getting-started/install-and-setup)**
BobShell should auto-install on Mac Bob isntances 

**📚 Note:** Public BobShell documentation is available at: **https://bob.ibm.com/docs/shell**

**For all users**, verify that BobShell is installed and accessible:

```bash
# Check BobShell version
bob --version

# View help information
bob --help
```

**Expected Output:**
```
Bob CLI v1.x.x
Usage: bob [options] [command]
...
```

**If you see "command not found" or similar error:**
- Windows users: Follow the [installation guide](https://internal.bob.ibm.com/docs/shell/install-and-setup) to install BobShell
- macOS/Linux users: Verify Bob is installed and the shell component is enabled
- Check that BobShell is in your system PATH

**What's Happening:**
- The `--version` flag displays the installed version of BobShell
- The `--help` flag shows all available commands and options
- This confirms BobShell is properly installed and in your PATH

### Step 2: Interactive Mode

Launch Bob in interactive mode to chat directly from the terminal:

```bash
# Start interactive BobShell session
bob
```

**What Happens:**
- Simply typing `bob` launches an interactive BobShell session
- You'll see a prompt where you can chat with Bob directly
- All of Bob's capabilities are available through natural language commands

**Try These Commands in Interactive Mode:**

```
# Ask Bob to explain a concept
> Explain what a closure is in JavaScript

# Request code generation
> Create a Python function to calculate fibonacci numbers

```

To exit the interactive mode, press `Ctrl+C` twice.

**📚 Learn More:** See the [BobShell Interactive Mode documentation](https://bob.ibm.com/docs/shell/getting-started/start-bobshell-interactive) for additional features and options.

**What's Happening:**
- Interactive mode provides a conversational interface in the terminal
- You can ask questions, request code, and get explanations
- Perfect for quick queries without opening the full IDE
- Session history is maintained during the conversation

### Step 3: Non-Interactive Mode

Execute single commands without entering interactive mode. Let's create a simple test file first:

```bash
# Create a simple Python file to work with
echo 'def add(a, b):
    return a + b

def multiply(x, y):
    return x * y' > calculator.py
```

Now try these non-interactive commands:

```bash
# Explain code in a file
bob "Explain what the calculator.py file does"

# Ask for code review
bob "Review calculator.py and suggest improvements"

# Generate new code
bob "Create a Python function that calculates the factorial of a number" --yolo --hide-intermediary-output > factorial.py

# Ask a quick question
bob "What is the difference between a list and a tuple in Python?"
```

**What's Happening:**
- Non-interactive mode executes a single command and exits
- Simply use `bob "your prompt"` for one-off commands
- For commands that requires explicit approval to call specific tools at Bob, you need to add --yolo argument for auto-approval.
- Perfect for automation and scripting
- Results are output to stdout for easy capture
- Can be chained with other CLI tools using pipes

**📚 Learn More:** See the [BobShell Non-Interactive Mode documentation](https://bob.ibm.com/docs/shell/getting-started/start-bobshell-non-interactive) for additional features and options.

### Step 4: Using Session Resume

Bob automatically saves your interactive sessions, allowing you to resume previous conversations and continue where you left off.

**Resuming Sessions:**

```bash
# List available sessions
bob --list-sessions

# Resume the most recent session
bob --resume latest

# Resume a specific session by index
bob --resume 5
```

**Using Session Resume in Your Workflow:**

Bob automatically saves your conversation history, so you can return to previous work:

```
# Start a new session
bob

# Work on your code
> Review calculator.py and suggest improvements

# Bob provides suggestions...

# Exit the session (Ctrl+C twice)

# Later, resume the same session
bob --resume latest

# Continue from where you left off
> Let's implement those suggestions now
```

**How Session Resume Works:**

- Bob automatically saves all interactive sessions
- Each session is indexed and can be listed with `--list-sessions`
- Use `--resume latest` to continue your most recent work
- Use `--resume <index>` to return to a specific session
- Session history includes all conversation context

**Managing Sessions:**

```bash
# List all available sessions
bob --list-sessions

# Delete a specific session
bob --delete-session 3

# Resume and continue working
bob --resume latest
```

**When to Use Session Resume:**

1. **Continuing Work:** Pick up where you left off after a break
2. **Context Preservation:** Maintain conversation context across sessions
3. **Multiple Projects:** Switch between different project sessions
4. **Learning and Experimentation:** Return to previous explorations

**Example Workflow:**

```bash
# Start working on a feature
bob
> Analyze myapp.js for performance issues
# Bob identifies several issues
> Suggest optimizations for the database queries
# Exit session

# Later, resume to continue
bob --resume latest
> Let's implement those database optimizations now
# Bob remembers the previous analysis and continues
```

**💡 Tip:** Use `--resume latest` when you want to continue your most recent work, or `--list-sessions` to see all available sessions and choose a specific one.

### Step 5: Understanding Output Redirection

When using output redirection (`>`) with BobShell, you need to understand how Bob handles its output to get clean code files.

**⚠️ Important: Output Redirection Behavior**

By default, when you redirect Bob's output to a file, **Bob's thinking process and intermediary output will be included** in the file along with the generated code. To get only the code:

**Option 1: Use the `--hide-intermediary-output` flag**
```bash
# Generate code with clean output
bob "Create a Python function that calculates the factorial of a number" --yolo --hide-intermediary-output > factorial.py
```

**Option 2: Include file writing instruction in the prompt**
```bash
# Ask Bob to write directly to the file
bob "Create a Python function that calculates the factorial of a number and write it to factorial.py" --yolo
```

**What Gets Included Without These Approaches:**
- Bob's thinking process
- Tool usage messages
- Status updates
- The generated code

**What You Get With These Approaches:**
- Only the clean, generated code
- No intermediary messages
- Ready-to-use files

**Example Comparison:**

```bash
# ❌ This includes Bob's thinking in the file
bob "Create a sorting function" --yolo > sort.py

# ✅ This creates a clean code file
bob "Create a sorting function" --yolo --hide-intermediary-output > sort.py

# ✅ This also creates a clean code file
bob "Create a sorting function and write it to sort.py" --yolo
```

**💡 Best Practice:** Always use `--hide-intermediary-output` when redirecting to files, or explicitly ask Bob to write to the file in your prompt.

## BobShell Best Practices

### BobShell Best Practices

1. **Use Specific Commands**: Be specific in your requests for better results
   ```bash
   # Good
   bob generate "Create a React component for user authentication with email and password fields, validation, and error handling"
   
   # Less specific
   bob generate "Create a login form"
   ```

2. **Leverage Output Formats**: Use appropriate formats for different use cases
   ```bash
   # JSON for programmatic processing
   bob "Analyze ./src and provide results in JSON format" --hide-intermediary-output > analysis.json
   
   # Markdown for documentation
   bob "Review ./src for code quality and output in markdown format" --hide-intermediary-output > review.md
   
   # HTML for reports
   bob "Perform security scan of ./src and output in HTML format" --hide-intermediary-output > security-report.html
   ```

> **💡 Automatic Optimization**
> When you run BobShell commands, Bob's intelligent resource optimization automatically selects the most appropriate model for each task. You don't need to specify which model to use—Bob handles this transparently, optimizing for both quality and cost.

3. **Use Git Integration**: Review only changed code
   ```bash
   # Review changes in current branch
   bob "Review code changes between main and HEAD branches"

   # Review uncommitted changes
   bob "Review uncommitted changes (git diff HEAD)"
   ```

4. **Implement Caching**: Cache Bob responses for repeated operations
   ```bash
   # Enable caching
   bob config set cache-enabled true
   bob config set cache-ttl 3600
   ```

> 📌 For more information on BobShell see the documentation site: https://bob.ibm.com/docs/shell 

---
## Introduction to MCP 

## Overview

> 🔧 Bob Differentiator:
> This lab showcases Bob's most powerful differentiator—its extensible architecture. Through customizable modes and MCP server integrations, Bob adapts to YOUR environment and workflows. Unlike other AI assistants that work in isolation, Bob can connect to internal APIs, databases, documentation systems, and custom tools. This extensibility makes Bob uniquely valuable for enterprise teams with specific needs and existing toolchains.

## What is MCP?

> 📌 Bob documentation on MCP: https://bob.ibm.com/docs/ide/configuration/mcp/understanding-mcp 

**Model Context Protocol (MCP)** is an open protocol that enables AI assistants like Bob to:
- Access external data sources
- Execute custom tools and functions
- Integrate with third-party services
- Extend capabilities beyond built-in features

> **🎯 Why MCP Matters**
> MCP is a key part of Bob's extensible architecture. It allows Bob to integrate with your company's internal tools, APIs, and services. This means Bob can access your documentation, query your databases, create tickets in your issue tracker, and deploy to your infrastructure—all through natural language. Bob adapts to YOUR environment, not the other way around.

**Key Concepts:**
- **MCP Server**: A service that exposes tools and resources to Bob
- **Tools**: Functions that Bob can call to perform actions
- **Resources**: Data sources that Bob can query
- **Prompts**: Pre-defined prompt templates
- **Custom Mode**: A specialized Bob configuration for specific tasks

## Understanding MCP Architecture (Read Only - No Actions Required)

> **📖 This section is informational only. No actions are required.**

### MCP Protocol Basics

MCP uses a client-server architecture:

```
┌─────────────┐         MCP Protocol       ┌─────────────┐
│             │◄──────────────────────────►│             │
│  Bob Client │    JSON-RPC over stdio     │ MCP Server  │
│             │    or HTTP/WebSocket       │             │
└─────────────┘                            └─────────────┘
       │                                          │
       │                                          │
       ▼                                          ▼
  User Requests                            External Services
  - Ask questions                          - JIRA API
  - Execute tasks                          - Database
  - Get information                        - Deployment tools
                                          - Custom APIs
```

**Key Components:**

1. **Tools**: Functions Bob can call
   ```json
   {
     "name": "create_jira_ticket",
     "description": "Create a new JIRA ticket",
     "parameters": {
       "title": "string",
       "description": "string",
       "priority": "string"
     }
   }
   ```

2. **Resources**: Data Bob can access
   ```json
   {
     "uri": "docs://api-reference",
     "name": "API Documentation",
     "mimeType": "text/markdown"
   }
   ```

3. **Prompts**: Pre-defined templates
   ```json
   {
     "name": "code_review",
     "description": "Perform code review",
     "template": "Review this code for: {criteria}"
   }
   ```

### MCP Server Lifecycle

```
1. Initialize → 2. Register Tools → 3. Handle Requests → 4. Cleanup
     │                  │                    │               │
     │                  │                    │               │
     ▼                  ▼                    ▼               ▼
  Setup            Define tools        Execute tools    Close connections
  connections      and resources       return results   cleanup resources
```

### Custom Business Logic (Optional Extension)

**💡 OPTIONAL: This is an example for extending the server**

You can implement organization-specific tools like this:

```javascript
// Example: Customer lookup tool
async function lookupCustomer(customerId) {
  // Validate input
  if (!customerId) {
    throw new Error('Customer ID required');
  }
  
  // Call internal API
  const response = await fetch(`${API_BASE}/customers/${customerId}`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  });
  
  // Return structured data
  return {
    customer: await response.json(),
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'internal-api'
    }
  };
}
```

> 📌 Bob documentation on MCP: https://bob.ibm.com/docs/ide/configuration/mcp/understanding-mcp 

------

## Custom Modes

### Creating Custom Modes (Read Only - No Actions Required)

> 📌 Bob documentation on custom modes: https://bob.ibm.com/docs/ide/configuration/custom-modes 

> **📖 This section explains custom modes. The mode files are already provided.**

### Understanding Custom Modes

> 🎯 Bob Differentiator:
> Custom modes are another key differentiator for Bob. You can create specialized modes for code review, documentation, architecture design, DevOps workflows, or any team-specific process. These modes can be shared through the marketplace, ensuring consistent behavior across your team. This level of customization is unique to Bob.

Custom modes configure Bob for specific workflows:

```json
{
  "name": "DevOps Mode",
  "description": "Specialized mode for DevOps tasks",
  "capabilities": [
    "deployment",
    "monitoring",
    "incident-response"
  ],
  "tools": [
    "deploy_application",
    "check_health",
    "view_logs"
  ],
  "prompts": [
    "deployment_checklist",
    "incident_runbook"
  ]
}
```

### DevOps Mode

**File: `custom-mode/devops-mode.json`**

This mode is optimized for DevOps workflows:

**Features:**
- Deployment automation
- Infrastructure management
- Monitoring and alerting
- Incident response
- Log analysis

**Tools Available:**
- `deploy`: Deploy applications
- `rollback`: Rollback deployments
- `scale`: Scale services
- `logs`: View logs
- `metrics`: Get metrics
- `alert`: Create alerts

**Prompts:**
- Deployment checklist
- Incident response runbook
- Post-mortem template
- Change request template

### Code Review Mode

**File: `custom-mode/code-review-mode.json`**

Specialized for code reviews:

**Features:**
- Automated code analysis
- Security scanning
- Best practices checking
- Performance analysis
- Documentation review

**Tools:**
- `analyze_code`: Deep code analysis
- `check_security`: Security scan
- `review_pr`: PR review
- `suggest_improvements`: Improvement suggestions

**Prompts:**
- Code review checklist
- Security review template
- Performance review guide

### Architecture Mode

**File: `custom-mode/architecture-mode.json`**

For architecture and design:

**Features:**
- System design assistance
- Architecture documentation
- Technology recommendations
- Scalability analysis
- Cost estimation

**Tools:**
- `design_system`: System design help
- `evaluate_tech`: Technology evaluation
- `estimate_cost`: Cost estimation
- `generate_diagram`: Architecture diagrams

## Best Practices (Read Only - Reference Material)

> 📌 Bob documentation on best practices: https://bob.ibm.com/docs/ide/getting-started/best-practices

> **📖 This section provides best practices for reference. No actions required.**

### Security Best Practices

1. **Authentication & Authorization**
   - Use API tokens, not passwords
   - Implement role-based access control
   - Validate all inputs
   - Use HTTPS for all communications

2. **Data Protection**
   - Encrypt sensitive data
   - Don't log secrets
   - Implement rate limiting
   - Use secure credential storage

3. **Audit & Monitoring**
   - Log all tool executions
   - Monitor for suspicious activity
   - Set up alerts
   - Regular security reviews

### Performance Best Practices

1. **Caching**
   - Cache frequently accessed data
   - Implement cache invalidation
   - Use appropriate TTLs

2. **Async Operations**
   - Use async/await for I/O
   - Implement timeouts
   - Handle concurrent requests

3. **Resource Management**
   - Connection pooling
   - Proper cleanup
   - Memory management

### Reliability Best Practices

1. **Error Handling**
   - Graceful degradation
   - Meaningful error messages
   - Retry logic with backoff
   - Circuit breakers

2. **Monitoring**
   - Health checks
   - Metrics collection
   - Logging
   - Alerting

3. **Testing**
   - Unit tests
   - Integration tests
   - Load testing
   - Security testing

---

## Advanced Topics (Read Only - Reference Material)

> **📖 This section covers advanced topics for reference. No actions required.**

### Multi-Server Architecture

**💡 REFERENCE: How to configure multiple MCP servers**

1. Open Bob Settings (gear icon) → MCP
2. Edit the Global or Project MCP configuration JSON
3. Add multiple servers:
   ```json
   {
     "mcpServers": {
       "jira-server": {
         "command": "node",
         "args": ["jira-server.js"],
         "cwd": "/path/to/jira-server"
       },
       "db-server": {
         "command": "node",
         "args": ["db-server.js"],
         "cwd": "/path/to/db-server"
       },
       "deploy-server": {
         "command": "node",
         "args": ["deploy-server.js"],
         "cwd": "/path/to/deploy-server"
       }
     }
   }
   ```
4. Save and restart Bob

When you ask Bob (in Advanced mode) to "Create a JIRA ticket and deploy the fix", it will intelligently use tools from multiple servers.

### Custom Protocol Extensions

Extend MCP with custom capabilities:

```javascript
// Custom protocol extension
class CustomMCPServer extends MCPServer {
  async handleCustomRequest(request) {
    // Custom logic
    return {
      result: 'custom response'
    };
  }
}
```

### AI Model Integration

Integrate with custom AI models:

```javascript
// Use custom model for specific tasks
async function analyzeWithCustomModel(code) {
  const response = await fetch('https://your-model-api.com/analyze', {
    method: 'POST',
    body: JSON.stringify({ code }),
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
}
```

----

## Managing Custom Modes and MCP Servers (Optional)

> **💡 OPTIONAL: Learn how to manage modes and servers**

### Installing Custom Modes

**💡 OPTIONAL: How to install custom modes**

1. Open Bob Settings
2. Navigate to **Custom Modes**
3. Click **Import Mode**
4. Select your mode file (e.g., `devops-mode.json`)
5. The mode appears in Bob's mode selector

### Removing Custom Modes

**To remove a custom mode:**

1. Open Bob Settings
2. Navigate to **Custom Modes**
3. Find the mode you want to remove
4. Click the **trash/delete icon** next to the mode
5. Confirm deletion

**Alternative - Manual removal:**
- Custom modes are stored in: `~/.bob/modes/`
- Delete the JSON file for the mode you want to remove
- Restart VS Code

### Removing MCP Servers

**To remove an MCP server:**

1. Open Bob Settings (gear icon)
2. Navigate to **MCP** section
3. Choose **Global MCPs** or **Project MCPs**
4. Edit the JSON configuration file
5. Remove the server entry from the `mcpServers` object
6. Save the file
7. Restart Bob or reload VS Code

**Configuration file locations:**
- Global MCPs: `~/.bob/mcp.json`
- Project MCPs: `.bob/mcp.json` in your project root

**Example - Removing a server:**
```json
{
  "mcpServers": {
    "my-custom-server": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/path/to/server"
    },
    "server-to-remove": {  // Delete this entire block
      "command": "node",
      "args": ["other-server.js"],
      "cwd": "/path/to/other"
    }
  }
}
```

After removal:
```json
{
  "mcpServers": {
    "my-custom-server": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/path/to/server"
    }
  }
}
```

> **💡 Tip:** Keep a backup of your MCP configuration before making changes, so you can easily restore servers if needed.

----

## Troubleshooting

### Common Issues

1. **Server Won't Start**
   - Check server logs in terminal
   - Verify dependencies: `npm install` in server directory
   - Check configuration files in `config/`
   - Ensure ports aren't already in use

2. **Tools Not Available in Bob**
   - **Most Common:** Verify you're in **Advanced mode** - MCP tools only work in Advanced mode
   - Check MCP server is configured in Bob Settings → MCP (Global or Project)
   - Verify the server is running: `ps aux | grep node`
   - Check server logs for errors in the terminal
   - Restart the MCP server and reload VS Code
   - Verify the `cwd` path in your MCP configuration is correct

3. **Authentication Failures**
   - Check environment variables are set
   - Verify API tokens haven't expired
   - Test API directly with curl
   - Check server logs for auth errors

4. **Custom Mode Not Working**
   - Verify mode file is valid JSON
   - Check mode is enabled in Bob Settings
   - Restart VS Code after importing
   - Review mode configuration for errors

## Summary

In this lab, you learned:

✅ Understanding MCP architecture and protocol
✅ Implementing tools for external integrations
✅ Creating custom Bob modes for specific workflows
✅ Security and performance best practices
✅ Advanced topics and extensions

> **🎯 Extensibility: Bob's Superpower**
> You've now experienced Bob's extensible architecture firsthand. By creating MCP servers and custom modes, you can tailor Bob to your organization's unique needs. This extensibility—combined with Bob's other differentiators like intelligent resource optimization, Bob Findings, and Java modernization —makes Bob a uniquely powerful tool for enterprise development teams.


---

**Lab 2 Complete! 🎉**