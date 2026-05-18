# OpenShift Operations with Bob

## Overview

Learn to manage and operate Red Hat OpenShift Container Platform using IBM Bob's AI-native approach. These hands-on labs guide you through deploying, monitoring, and troubleshooting cloud-native applications using natural language interactions and custom automation.

This lab collection provides two complementary learning paths for working with OpenShift through Bob:

1. **MCP-Based Automation** - Use a custom Model Context Protocol (MCP) server to interact with OpenShift programmatically
2. **Custom Mode Workflows** - Leverage specialized Bob modes for systematic OpenShift operations and troubleshooting

Both labs can be completed independently or sequentially to build comprehensive OpenShift management skills.

---

## Available Labs

### Lab 1: Basics with OpenShift MCP Server

**Duration**: 20-25 minutes  
**Difficulty**: Intermediate

#### What You'll Learn

- Configure and use a custom OpenShift MCP server with Bob
- Deploy applications to OpenShift using natural language
- Create routes and expose services externally
- Monitor applications through logs, events, and metrics
- Understand MCP tools for cluster management

#### Key Features

The custom MCP server provides tools for:

- **Cluster Management** - Get cluster info, list projects/namespaces
- **Pod Operations** - List pods, view logs, describe pods, execute commands
- **Deployment Management** - Deploy apps, scale deployments, rollout status, rollback
- **Route Management** - Create TLS routes, list routes for external access
- **Build Operations** - Trigger builds (S2I), view build logs, list builds
- **Monitoring** - Node metrics, pod metrics, resource quotas, events

#### Prerequisites

- [ ] OpenShift CLI (`oc`) installed
- [ ] Access to an OpenShift cluster
- [ ] Python 3.8+ and UV installed
- [ ] Bob installed and running

#### Get Started

📖 **[Start Lab 1: Basics with OpenShift MCP Server →](./basics-with-ocp-mcp/README.md)**

---

### Lab 2: Custom OpenShift Modes

**Duration**: 25-35 minutes  
**Difficulty**: Intermediate to Advanced

#### What You'll Learn

- Use custom Bob modes designed for OpenShift operations
- Deploy and monitor applications using the OpenShift DevOps mode
- Troubleshoot application issues with the OpenShift Ops Assistant mode
- Understand OpenShift's control loop architecture and resource hierarchy
- Master service discovery, routing, and networking concepts
- Apply systematic troubleshooting workflows for debugging

#### Key Concepts Covered

- **Control Loop Architecture** - How OpenShift reconciles desired vs actual state
- **Resource Hierarchy** - Deployments → ReplicaSets → Pods relationships
- **Service Discovery & Load Balancing** - Stable endpoints and external routing
- **Security Boundaries** - SCCs, RBAC, and namespace isolation
- **Troubleshooting Workflows** - Systematic diagnosis of CrashLoopBackOff and other issues

#### Custom Modes Included

1. **OpenShift DevOps Mode** - Streamlined workflows for deployment and management
2. **OpenShift Ops Assistant Mode** - Specialized troubleshooting and diagnostics

#### Prerequisites

- [ ] OpenShift CLI (`oc`) installed
- [ ] Access to an OpenShift cluster (ROKS, CRC, or OpenShift 4.x)
- [ ] A namespace/project for experimentation
- [ ] Bob installed and running

#### Get Started

📖 **[Start Lab 2: Custom OpenShift Modes →](./openshift-custom-modes/README.md)**

---

## Getting Started

These labs are **complementary but independent**. You can complete them in any order, though Lab 1 → Lab 2 provides a natural progression from tool-building to concept mastery.
