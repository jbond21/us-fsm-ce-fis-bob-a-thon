# Lab: MCP Server Development for Bob in Jenkins Pipelines

**Duration:** 60 minutes  
**Objective:** Learn to create, configure, and integrate custom MCP servers with Bob in CI/CD pipelines  
**Prerequisites:**
- Completed Lab 5 (DCR & Jira Reporting) or familiarity with MCP concepts
- Understanding of Jenkins pipelines
- Basic knowledge of Node.js or Python
- Access to the workshop Jenkins environment

---

## Table of Contents

1. [Overview](#overview)
2. [Understanding MCP in CI/CD Context](#understanding-mcp-in-cicd-context)
3. [Part 1: Building a Simple Pipeline MCP Server](#part-1-building-a-simple-pipeline-mcp-server)
4. [Part 2: Integrating MCP Server with Jenkins](#part-2-integrating-mcp-server-with-jenkins)
5. [Part 3: Creating Pipeline-Specific Tools](#part-3-creating-pipeline-specific-tools)
6. [Part 4: Advanced MCP Patterns](#part-4-advanced-mcp-patterns)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Key Takeaways](#key-takeaways)

---

## Overview

### What You'll Build

In this lab, you'll create a **Pipeline Metrics MCP Server** that provides Bob with tools to:
- Query Jenkins build history and metrics
- Generate deployment reports
- Track pipeline performance over time
- Create custom pipeline dashboards
- Export metrics for analysis

### Learning Objectives

By the end of this lab, you will:

- ✅ Understand MCP server architecture in CI/CD environments
- ✅ Create a functional MCP server for pipeline operations
- ✅ Configure Bob to use your MCP server in Jenkins
- ✅ Implement custom tools that enhance pipeline capabilities
- ✅ Test and debug MCP server integrations in containers
- ✅ Apply security best practices for MCP in CI/CD

### Why MCP Servers Matter in CI/CD

> **🎯 Bob Differentiator: Pipeline Intelligence**
> 
> MCP servers allow Bob to interact with your CI/CD infrastructure, not just analyze code. This lab teaches you how to extend Bob's capabilities to query build history, generate reports, and integrate with pipeline tools - all from within your Jenkins pipeline.

**Traditional Approach:**
```
Pipeline runs → Manual metric collection → 
Manual report generation → Manual analysis
```

**MCP-Enhanced Approach:**
```
Pipeline runs → Bob queries metrics via MCP → 
Automated report generation → Intelligent insights
```

---

## Understanding MCP in CI/CD Context

### MCP Architecture in Jenkins

```
┌─────────────────────────────────────────────────────────┐
│                   JENKINS PIPELINE                      │
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │ build-tools  │         │  oc-tools    │            │
│  │  container   │         │  container   │            │
│  └──────────────┘         └──────────────┘            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │           bob container                         │  │
│  │                                                 │  │
│  │  ┌──────────────┐    MCP Protocol              │  │
│  │  │  Bob CLI     │◄──────────────────┐          │  │
│  │  └──────────────┘                   │          │  │
│  │         ▲                            │          │  │
│  │         │ reads                      ▼          │  │
│  │  ┌──────────────┐         ┌──────────────────┐ │  │
│  │  │.bob/mcp.json │         │  MCP Server      │ │  │
│  │  └──────────────┘         │  (Your Code)     │ │  │
│  │                           │  - Node.js/Python│ │  │
│  │                           │  - Custom Tools  │ │  │
│  │                           └──────────────────┘ │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  Shared workspace: /workspace                          │
└─────────────────────────────────────────────────────────┘
```

### Key Differences from IDE MCP Servers

| Aspect | IDE MCP Server | Pipeline MCP Server |
|--------|----------------|---------------------|
| **Lifecycle** | Long-running, user session | Per-build, ephemeral |
| **Credentials** | User's personal tokens | Injected via Kubernetes secrets |
| **Environment** | User's laptop | Container with limited tools |
| **Purpose** | Interactive development | Automated operations |
| **Error Handling** | Can prompt user | Must handle errors autonomously |

---

## Part 1: Building a Simple Pipeline MCP Server

### Exercise 1.1: Create a Node.js MCP Server

We'll build a simple MCP server that provides pipeline metrics tools.

**Step 1: Create Project Structure**

In your local development environment (not in Jenkins yet):

```bash
# Create project directory
mkdir pipeline-metrics-mcp
cd pipeline-metrics-mcp

# Initialize npm project
npm init -y

# Install MCP SDK
npm install @modelcontextprotocol/sdk

# Create source directory
mkdir src
```

**Step 2: Create the Server Foundation**

Create `src/index.js`:

```javascript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Server configuration
const SERVER_NAME = 'pipeline-metrics-server';
const SERVER_VERSION = '1.0.0';

// Create server instance
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools = [
  {
    name: 'get_build_metrics',
    description: 'Get metrics for the current build from workspace artifacts',
    inputSchema: {
      type: 'object',
      properties: {
        metric_type: {
          type: 'string',
          enum: ['test_results', 'build_time', 'code_coverage', 'all'],
          description: 'Type of metrics to retrieve',
        },
      },
      required: ['metric_type'],
    },
  },
  {
    name: 'generate_pipeline_report',
    description: 'Generate a comprehensive pipeline execution report',
    inputSchema: {
      type: 'object',
      properties: {
        include_history: {
          type: 'boolean',
          description: 'Include historical comparison',
          default: false,
        },
      },
    },
  },
  {
    name: 'analyze_build_artifacts',
    description: 'Analyze artifacts produced by the build',
    inputSchema: {
      type: 'object',
      properties: {
        artifact_pattern: {
          type: 'string',
          description: 'Glob pattern for artifacts to analyze',
          default: '**/*.jar',
        },
      },
    },
  },
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'get_build_metrics':
        result = await getBuildMetrics(args.metric_type);
        break;
      case 'generate_pipeline_report':
        result = await generatePipelineReport(args.include_history);
        break;
      case 'analyze_build_artifacts':
        result = await analyzeBuildArtifacts(args.artifact_pattern);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Tool implementations
async function getBuildMetrics(metricType) {
  const workspace = process.env.WORKSPACE || '/workspace';
  const metrics = {};

  if (metricType === 'test_results' || metricType === 'all') {
    // Read test results from Surefire reports
    const surefireDir = join(workspace, 'order-service/target/surefire-reports');
    if (existsSync(surefireDir)) {
      // Parse test results (simplified)
      metrics.tests = {
        total: 10,
        passed: 8,
        failed: 2,
        skipped: 0,
      };
    }
  }

  if (metricType === 'build_time' || metricType === 'all') {
    // Get build time from environment or calculate
    metrics.build_time = {
      start: process.env.BUILD_START_TIME || 'N/A',
      duration_seconds: 120,
    };
  }

  return JSON.stringify(metrics, null, 2);
}

async function generatePipelineReport(includeHistory) {
  const workspace = process.env.WORKSPACE || '/workspace';
  
  let report = '# Pipeline Execution Report\n\n';
  report += `Build Number: ${process.env.BUILD_NUMBER || 'N/A'}\n`;
  report += `Branch: ${process.env.GIT_BRANCH || 'N/A'}\n`;
  report += `Timestamp: ${new Date().toISOString()}\n\n`;
  
  // Add metrics
  const metrics = await getBuildMetrics('all');
  report += '## Metrics\n\n';
  report += '```json\n' + metrics + '\n```\n\n';
  
  if (includeHistory) {
    report += '## Historical Comparison\n\n';
    report += 'Historical data would be fetched from Jenkins API or stored metrics.\n';
  }
  
  return report;
}

async function analyzeBuildArtifacts(pattern) {
  const workspace = process.env.WORKSPACE || '/workspace';
  
  // In a real implementation, you'd scan for artifacts matching the pattern
  return `Analyzing artifacts matching pattern: ${pattern}\n` +
         `Workspace: ${workspace}\n` +
         `Found artifacts: order-service-1.0.0.jar (15.2 MB)\n`;
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Pipeline Metrics MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
```

**Step 3: Update package.json**

```json
{
  "name": "pipeline-metrics-mcp",
  "version": "1.0.0",
  "description": "MCP server for Jenkins pipeline metrics",
  "main": "src/index.js",
  "type": "module",
  "bin": {
    "pipeline-metrics-server": "./src/index.js"
  },
  "scripts": {
    "start": "node src/index.js"
  },
  "keywords": ["mcp", "bob", "jenkins", "metrics"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  }
}
```

**Step 4: Make the Server Executable**

```bash
chmod +x src/index.js
```

**Step 5: Test Locally**

```bash
# Test that the server starts
node src/index.js

# You should see: "Pipeline Metrics MCP Server running on stdio"
# Press Ctrl+C to stop
```

---

## Part 2: Integrating MCP Server with Jenkins

### Exercise 2.1: Package MCP Server for Jenkins

**Step 1: Create Dockerfile for MCP Server**

Create `Dockerfile` in your project:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Make executable
RUN chmod +x src/index.js

# Create symlink for easy execution
RUN npm link

ENTRYPOINT ["pipeline-metrics-server"]
```

**Step 2: Build and Push to OpenShift Registry**

```bash
# Build the image
docker build -t pipeline-metrics-mcp:latest .

# Tag for OpenShift registry
docker tag pipeline-metrics-mcp:latest \
  image-registry.openshift-image-registry.svc:5000/jenkins/pipeline-metrics-mcp:latest

# Login to OpenShift
oc login --token=<your-token> --server=<cluster-url>

# Push to registry
docker push image-registry.openshift-image-registry.svc:5000/jenkins/pipeline-metrics-mcp:latest
```

**Alternative: Use npx for Simpler Deployment**

If you don't want to build a container, you can publish to npm and use `npx`:

```bash
# Publish to npm (or private registry)
npm publish

# Then in Jenkins, use: npx pipeline-metrics-mcp
```

### Exercise 2.2: Register MCP Server in Pipeline

**Step 1: Update .bob/mcp.json**

Add your MCP server to the configuration:

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "uvx",
      "args": ["mcp-atlassian"],
      "env": {
        "JIRA_URL": "${JIRA_URL}",
        "JIRA_USERNAME": "${JIRA_USERNAME}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
      },
      "disabled": false,
      "alwaysAllow": [
        "jira_get_issue",
        "jira_search",
        "jira_add_comment"
      ]
    },
    "pipeline-metrics": {
      "command": "npx",
      "args": ["pipeline-metrics-mcp"],
      "env": {
        "WORKSPACE": "${WORKSPACE}",
        "BUILD_NUMBER": "${BUILD_NUMBER}",
        "GIT_BRANCH": "${GIT_BRANCH}"
      },
      "disabled": false,
      "alwaysAllow": [
        "get_build_metrics",
        "generate_pipeline_report",
        "analyze_build_artifacts"
      ]
    }
  }
}
```

**Step 2: Create Custom Mode for Pipeline Metrics**

Switch to **Mode Writer** and create:

```
Create a custom mode with slug `pipeline-metrics-reporter`. Append to @.bob/custom_modes.yaml.

Job: Generate comprehensive pipeline execution reports using the pipeline-metrics MCP server.

Responsibilities:
- Query build metrics via the pipeline-metrics MCP server
- Analyze test results, build times, and artifacts
- Generate formatted reports for stakeholders
- Compare current build with historical data
- Identify trends and anomalies

Available MCP tools (from pipeline-metrics server):
- get_build_metrics: Retrieve specific metrics
- generate_pipeline_report: Create comprehensive report
- analyze_build_artifacts: Analyze build outputs

Output format: Markdown report with sections:
- Executive Summary
- Build Metrics
- Test Results Analysis
- Artifact Analysis
- Historical Comparison
- Recommendations

Tool groups: read, mcp (pipeline-metrics server only)

MCP server restrictions: Only use pipeline-metrics server, only tools in alwaysAllow list
```

**Step 3: Add Pipeline Metrics Stage**

Add to your Jenkinsfile:

```groovy
stage('Pipeline Metrics Report') {
    steps {
        script {
            echo "=== Generating Pipeline Metrics Report ==="
            
            // Set environment variables for MCP server
            env.WORKSPACE = pwd()
            env.BUILD_START_TIME = currentBuild.startTimeInMillis.toString()
            
            def prompt = """Generate a comprehensive pipeline execution report.

Include:
1. Build metrics (time, status, stages)
2. Test results analysis
3. Artifact analysis
4. Comparison with previous builds
5. Recommendations for improvement

Use the pipeline-metrics MCP server tools to gather data."""
            
            def report = askBob(prompt, 'pipeline-metrics-reporter')
            
            writeFile file: 'pipeline-metrics-report.md', text: report
            archiveArtifacts artifacts: 'pipeline-metrics-report.md'
            
            echo "✅ Pipeline metrics report generated"
        }
    }
}
```

---

## Part 3: Creating Pipeline-Specific Tools

### Exercise 3.1: Add Deployment Tracking Tool

Enhance your MCP server with deployment tracking:

**Add to src/index.js:**

```javascript
// Add to tools array
{
  name: 'track_deployment',
  description: 'Track deployment information for audit trail',
  inputSchema: {
    type: 'object',
    properties: {
      environment: {
        type: 'string',
        enum: ['dev', 'staging', 'prod'],
        description: 'Target environment',
      },
      version: {
        type: 'string',
        description: 'Application version being deployed',
      },
      status: {
        type: 'string',
        enum: ['started', 'completed', 'failed', 'rolled_back'],
        description: 'Deployment status',
      },
    },
    required: ['environment', 'version', 'status'],
  },
}

// Add implementation
async function trackDeployment(environment, version, status) {
  const timestamp = new Date().toISOString();
  const buildNumber = process.env.BUILD_NUMBER || 'unknown';
  
  const deploymentRecord = {
    timestamp,
    build_number: buildNumber,
    environment,
    version,
    status,
    branch: process.env.GIT_BRANCH || 'unknown',
  };
  
  // In production, you'd write this to a database or file
  const workspace = process.env.WORKSPACE || '/workspace';
  const recordFile = join(workspace, 'deployment-history.json');
  
  let history = [];
  if (existsSync(recordFile)) {
    history = JSON.parse(readFileSync(recordFile, 'utf8'));
  }
  
  history.push(deploymentRecord);
  
  // Write back (in real implementation)
  // writeFileSync(recordFile, JSON.stringify(history, null, 2));
  
  return `Deployment tracked:\n${JSON.stringify(deploymentRecord, null, 2)}`;
}
```

### Exercise 3.2: Add Performance Benchmarking Tool

```javascript
// Add to tools array
{
  name: 'benchmark_build_performance',
  description: 'Benchmark build performance and compare with baselines',
  inputSchema: {
    type: 'object',
    properties: {
      stage_name: {
        type: 'string',
        description: 'Name of the stage to benchmark',
      },
      duration_seconds: {
        type: 'number',
        description: 'Duration of the stage in seconds',
      },
    },
    required: ['stage_name', 'duration_seconds'],
  },
}

// Implementation
async function benchmarkBuildPerformance(stageName, durationSeconds) {
  // Baseline performance targets (in seconds)
  const baselines = {
    'Checkout': 10,
    'Build': 120,
    'Unit Tests': 60,
    'Security Scan': 90,
    'Deploy': 180,
  };
  
  const baseline = baselines[stageName] || 60;
  const percentDiff = ((durationSeconds - baseline) / baseline * 100).toFixed(1);
  
  let status = 'NORMAL';
  if (durationSeconds > baseline * 1.5) {
    status = 'SLOW';
  } else if (durationSeconds > baseline * 2) {
    status = 'CRITICAL';
  }
  
  return `Stage: ${stageName}
Duration: ${durationSeconds}s
Baseline: ${baseline}s
Difference: ${percentDiff}%
Status: ${status}

${status === 'CRITICAL' ? '⚠️ Performance degradation detected!' : ''}`;
}
```

---

## Part 4: Advanced MCP Patterns

### Exercise 4.1: MCP Server with External API Integration

Create an MCP server that integrates with external services:

```javascript
// Add tool for querying external metrics
{
  name: 'query_external_metrics',
  description: 'Query metrics from external monitoring systems',
  inputSchema: {
    type: 'object',
    properties: {
      metric_name: {
        type: 'string',
        description: 'Name of the metric to query',
      },
      time_range: {
        type: 'string',
        description: 'Time range (e.g., "1h", "24h", "7d")',
        default: '1h',
      },
    },
    required: ['metric_name'],
  },
}

async function queryExternalMetrics(metricName, timeRange) {
  // In production, integrate with Prometheus, Grafana, etc.
  const prometheusUrl = process.env.PROMETHEUS_URL;
  
  if (!prometheusUrl) {
    return 'Prometheus URL not configured';
  }
  
  // Example: Query Prometheus
  // const response = await fetch(`${prometheusUrl}/api/v1/query?query=${metricName}`);
  // const data = await response.json();
  
  return `Querying ${metricName} for time range ${timeRange}
(Integration with external metrics system would go here)`;
}
```

### Exercise 4.2: Secure Credential Handling

**Best Practice: Never hardcode credentials**

```javascript
// Read credentials from environment (injected by Kubernetes)
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Validate required environment variables
function validateEnvironment() {
  const required = ['WORKSPACE', 'BUILD_NUMBER'];
  const missing = required.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

validateEnvironment();
```

---

## Best Practices

### 1. **Container Compatibility**
- Test MCP servers in the same container environment as Jenkins
- Use Alpine-based images for smaller size
- Handle missing dependencies gracefully

### 2. **Error Handling**
- Always return structured error responses
- Log errors to stderr (not stdout, which is used for MCP protocol)
- Provide actionable error messages

### 3. **Performance**
- Keep tool execution fast (<5 seconds)
- Cache expensive operations
- Use async/await for I/O operations

### 4. **Security**
- Never log sensitive data
- Validate all inputs
- Use environment variables for credentials
- Limit file system access

### 5. **Testing**
```bash
# Test MCP server locally
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node src/index.js

# Test with Bob CLI
bob --mcp-config test-mcp.json ask "Use the pipeline metrics server"
```

---

## Troubleshooting

### Common Issues

**1. "Command not found: npx"**
- Solution: Ensure Node.js is installed in the bob container
- Alternative: Use a custom container with Node.js

**2. "MCP server not responding"**
- Check: Server is using stdio transport correctly
- Check: No console.log() statements (use console.error() for logging)
- Check: JSON-RPC messages are properly formatted

**3. "Permission denied"**
- Solution: Ensure script is executable (`chmod +x`)
- Check: Container user has access to required files

**4. "Environment variables not available"**
- Solution: Verify env vars are set in .bob/mcp.json
- Check: Jenkins is passing variables to the pod

### Debug Mode

Add debug logging to your MCP server:

```javascript
const DEBUG = process.env.MCP_DEBUG === 'true';

function debug(message) {
  if (DEBUG) {
    console.error(`[DEBUG] ${message}`);
  }
}

// Use throughout code
debug(`Executing tool: ${name}`);
```

Enable in .bob/mcp.json:
```json
"env": {
  "MCP_DEBUG": "true"
}
```

---

## Key Takeaways

### What You've Learned

1. ✅ **MCP Architecture** - How MCP servers work in containerized CI/CD environments
2. ✅ **Server Development** - Building custom MCP servers with Node.js
3. ✅ **Pipeline Integration** - Configuring and using MCP servers in Jenkins
4. ✅ **Custom Tools** - Creating tools that enhance pipeline capabilities
5. ✅ **Best Practices** - Security, performance, and reliability patterns

### Real-World Applications

- **Pipeline Intelligence** - Query build history and metrics programmatically
- **External Integrations** - Connect Bob to monitoring, ticketing, and deployment systems
- **Automated Reporting** - Generate comprehensive reports without manual data collection
- **Audit Trails** - Track deployments and changes automatically

### Next Steps

1. **Extend Your Server** - Add more tools specific to your pipeline needs
2. **Integrate External Services** - Connect to Prometheus, Grafana, ServiceNow, etc.
3. **Share with Team** - Publish your MCP server for team-wide use
4. **Monitor Usage** - Track which tools are most valuable

---

## Additional Resources

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Bob MCP Documentation](https://bob.ibm.com/docs/ide/configuration/mcp/understanding-mcp)
- [Node.js MCP SDK](https://github.com/modelcontextprotocol/sdk)
- Workshop Lab 5 for Jira MCP integration example

---

**Congratulations!** You've built a custom MCP server that extends Bob's capabilities in your Jenkins pipeline. You can now create tools that integrate with any system your pipeline needs to interact with.