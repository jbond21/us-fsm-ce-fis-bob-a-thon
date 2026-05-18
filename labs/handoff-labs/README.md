# Bob Handoff Labs

Advanced labs demonstrating Bob's capabilities in custom development workflows, code modernization, and cloud-native operations.

---

## Overview

These hands-on labs showcase IBM Bob's AI-powered development capabilities across diverse scenarios—from extending Bob itself to modernizing legacy applications and managing cloud infrastructure. Each lab is self-contained and can be completed independently, allowing you to focus on the skills most relevant to your work.

### What You'll Experience

**Extend Bob's Capabilities** (Labs 1-2)
- Build custom modes that encode your team's workflows and best practices
- Create MCP servers that give Bob new tools and integrations
- Learn patterns for making Bob work the way you work

**Practical Development Scenarios** (Labs 3-6)
- Manage OpenShift clusters using natural language
- Translate code between programming languages
- Build full-stack applications from scratch
- Modernize legacy Java applications to modern versions

### Lab Categories

| Category | Labs | Focus Area |
|----------|------|------------|
| **Bob Customization** | 1-2 | Custom modes, MCP servers, extending Bob |
| **Cloud Operations** | 3 | OpenShift deployment, monitoring, troubleshooting |
| **Code Translation** | 4 | Cross-language migration, feature mapping |
| **Application Development** | 5 | Full-stack development, rapid prototyping |
| **Legacy Modernization** | 6 | Java 8→17/21, modern features, refactoring |

### Time Investment

- **Quick Start** (20-30 min): Labs 4, 5
- **Standard** (30-60 min): Labs 1, 3, 6
- **Deep Dive** (2+ hours): Lab 2 (all 5 examples)

---

## Available Labs

### 1. Bob Mode Builder

**Duration**: 30 minutes to 2+ hours
**Difficulty**: Beginner to Advanced

#### What You'll Learn

- Create custom Bob modes tailored to your specific workflows
- Configure mode behavior, tool access, and file restrictions
- Build workflow modes that orchestrate multi-step processes
- Use mode templates and examples as starting points
- Apply best practices for mode design and maintenance

#### Key Features

- **Quick Start Guide** - 30-minute tutorial to create your first mode
- **5 Production Examples** - Real-world modes you can use immediately
- **Templates** - Starter templates for common mode patterns
- **Advanced Techniques** - Multi-mode workflows and complex configurations

**Key benefit:** Custom modes enable 60-80% development acceleration and consistent code quality.

#### Prerequisites

- [ ] Bob installed and running
- [ ] Basic familiarity with Bob's standard modes
- [ ] Understanding of your team's development workflows

#### Get Started

📖 **[Start Lab 1: Bob Mode Builder →](./bob-mode-labs/README.md)**

---

### 2. Example MCP Servers

**Duration**: 30 minutes to 3+ hours
**Difficulty**: Beginner to Advanced

#### What You'll Learn

- Build Model Context Protocol (MCP) servers using FastMCP
- Create tools that extend Bob's capabilities
- Implement structured data handling and validation
- Design file operations and database integrations
- Convert existing APIs to MCP servers

#### Key Features

Five production-ready examples:

- **Lab 01** - Simple Calculator: Basic MCP server fundamentals
- **Lab 02** - Structured Calculator: Organized project structure
- **Lab 03** - File Operations: Safe file system interactions
- **Lab 04** - Database Operations: SQLite integration patterns
- **Lab 05** - API to MCP: Convert REST APIs to MCP tools

#### Prerequisites

- [ ] Python 3.8+ installed
- [ ] UV package manager installed
- [ ] Bob installed and running
- [ ] FastAPI (for Lab 05 only)

#### Get Started

📖 **[Start Lab 2: Example MCP Servers →](./bob-mcp-labs/README.md)**

---

### 3. OpenShift Operations with Bob

**Duration**: 45-60 minutes
**Difficulty**: Intermediate to Advanced

#### What You'll Learn

- Manage Red Hat OpenShift Container Platform using Bob's AI-native approach
- Deploy applications to OpenShift using natural language
- Monitor applications through logs, events, and metrics
- Troubleshoot issues with systematic workflows
- Use both MCP-based automation and custom modes

#### Key Concepts Covered

- **MCP-Based Automation** - Custom OpenShift MCP server for programmatic control
- **Custom Mode Workflows** - Specialized Bob modes for operations and troubleshooting
- **Control Loop Architecture** - How OpenShift reconciles desired vs actual state
- **Service Discovery & Routing** - Stable endpoints and external access
- **Troubleshooting Workflows** - Systematic diagnosis of deployment issues

#### Prerequisites

- [ ] OpenShift CLI (`oc`) installed
- [ ] Access to an OpenShift cluster (ROKS, CRC, or OpenShift 4.x)
- [ ] Python 3.8+ and UV installed
- [ ] Bob installed and running

#### Get Started

📖 **[Start Lab 3: OpenShift Operations with Bob →](./openshift-with-bob/README.md)**

---

### 4. Python to JavaScript Translation

**Duration**: 20 minutes
**Difficulty**: Intermediate

#### What You'll Learn

- Translate code from one programming language to another
- Analyze source code structure and identify translation challenges
- Plan translation strategies systematically
- Map language-specific features to equivalents
- Maintain functionality across languages
- Apply best practices in both source and target languages

#### Key Features

- **Language Analysis** - Use Ask mode to understand Python code patterns
- **Translation Planning** - Use Architect mode to map features
- **Implementation** - Use Code mode to perform translation
- **Verification** - Compare outputs and validate functionality

Translates a Python data processing script (pandas, CSV handling, type hints) to JavaScript (Node.js, async/await, JSDoc).

#### Prerequisites

- [ ] Python 3.8+ installed
- [ ] Node.js 14+ installed
- [ ] UV package manager installed
- [ ] Bob installed and running

#### Get Started

📖 **[Start Lab 4: Python to JavaScript Translation →](./python-to-javascript/README.md)**

---

### 5. Simple App Development

**Duration**: 30-45 minutes
**Difficulty**: Beginner

#### What You'll Learn

- Build a complete full-stack application from scratch with Bob
- Use Bob's Architect mode for planning and design
- Use Bob's Code mode for rapid implementation
- Enable auto-approvals for faster development
- Apply literate coding principles for maintainable code
- Integrate frontend and backend components

#### Key Features

Build a full-stack todo application:

- **Backend** - Python Flask REST API with SQLite database
- **Frontend** - HTML5, CSS3, and vanilla JavaScript
- **CRUD Operations** - Create, read, update, delete todos
- **Persistent Storage** - SQLite database for data persistence
- **Modern Patterns** - RESTful API design, async operations

#### Prerequisites

- [ ] Python 3.8+ installed
- [ ] Node.js 14+ installed (for npm)
- [ ] Bob installed and running

#### Get Started

📖 **[Start Lab 5: Simple App Development →](./simple-app-development/README.md)**

---

### 6. Java Application Modernization

**Duration**: 45-60 minutes
**Difficulty**: Intermediate to Advanced

#### What You'll Learn

- Modernize legacy Java applications from Java 8 to Java 17/21
- Leverage modern Java features (records, sealed classes, pattern matching)
- Migrate from legacy APIs to modern alternatives
- Improve performance with modern JVM features
- Maintain backward compatibility during migration
- Create comprehensive migration documentation

#### Key Features

Modernize a legacy e-commerce application:

- **Records Migration** - Convert POJOs to immutable records
- **Sealed Classes** - Apply sealed class patterns for type hierarchies
- **Pattern Matching** - Replace instanceof checks with modern patterns
- **Switch Expressions** - Modernize control flow
- **API Updates** - Migrate Date/Calendar to java.time
- **Concurrency** - Leverage virtual threads (Java 21)

#### Prerequisites

- [ ] Java 17 or 21 installed
- [ ] Maven or Gradle installed
- [ ] Bob installed and running
- [ ] Understanding of Java 8 features

#### Get Started

📖 **[Start Lab 6: Java Application Modernization →](./simple-java-modernization/README.md)**

---

## Quick Reference

| Lab | Duration | Difficulty | Key Technologies | Best For |
|-----|----------|------------|------------------|----------|
| 1. Bob Mode Builder | 30min-2hrs | Beginner-Advanced | YAML, Bob modes | Teams wanting custom workflows |
| 2. Example MCP Servers | 30min-3hrs | Beginner-Advanced | Python, FastMCP | Extending Bob with new tools |
| 3. OpenShift Operations | 45-60min | Intermediate-Advanced | OpenShift, oc CLI, Python | DevOps, SRE teams |
| 4. Python to JavaScript | 20min | Intermediate | Python, Node.js | Code migration projects |
| 5. Simple App Development | 30-45min | Beginner | Python, Flask, JavaScript | Learning full-stack development |
| 6. Java Modernization | 45-60min | Intermediate-Advanced | Java 8/17/21, Maven | Legacy Java modernization |

---

## Getting Started

### How to Use These Labs

1. **Choose a lab** based on your interest and skill level (see Quick Reference above)
2. **Review prerequisites** to ensure you have required access/tools
3. **Open the lab file** and follow step-by-step instructions
4. **Complete at your own pace** - all labs are self-contained

### Recommended Learning Paths

**New to Bob?**
- Start with Lab 5 (Simple App Development) to experience Bob's core capabilities
- Then try Lab 1 (Bob Mode Builder) to customize Bob for your needs

**DevOps/SRE Focus?**
- Begin with Lab 3 (OpenShift Operations) for cloud-native operations
- Follow with Lab 2 (MCP Servers) to build custom integrations

**Modernization Projects?**
- Try Lab 6 (Java Modernization) for language upgrades
- Or Lab 4 (Python to JavaScript) for cross-language translation

**Want to Extend Bob?**
- Start with Lab 1 (Bob Mode Builder) for custom workflows
- Then Lab 2 (MCP Servers) for new capabilities

---

*Last Updated: May 2026*