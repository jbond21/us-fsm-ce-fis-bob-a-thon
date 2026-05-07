# Custom Handoff Labs for FIS Bob-a-thon

This directory contains three customized handoff labs designed specifically for the FIS Bob-a-thon workshop environment. These labs build upon the foundational concepts from Labs 1-5 and extend Bob's capabilities into advanced CI/CD scenarios.

---

## Overview

### What Are Handoff Labs?

Handoff labs are advanced, standalone exercises that participants can complete after the core workshop (Labs 1-5). They demonstrate real-world applications of Bob in production CI/CD pipelines and can be used as:

- **Post-workshop exercises** for participants who want to go deeper
- **Reference implementations** for teams building their own pipelines
- **Training materials** for advanced Bob capabilities

### Customization Approach

These labs have been specifically customized to use **only the tools and infrastructure already installed** in the FIS Bob-a-thon workshop:

✅ **Jenkins** with Kubernetes agents  
✅ **OpenShift** cluster with `oc` CLI  
✅ **Bob CLI** in containers  
✅ **Maven 3.9** with JDK 17  
✅ **Order-service** Spring Boot application  
✅ **Custom modes** system (`.bob/custom_modes.yaml`)  
✅ **MCP server** support (`.bob/mcp.json`)  

**No additional tools or setup required!**

---

## The Three Custom Labs

### 1. Auto-Recovery and Self-Healing Lab
**File:** [`bob-auto-recovery-self-healing-lab-CUSTOM.md`](bob-auto-recovery-self-healing-lab-CUSTOM.md)  
**Duration:** ~45 minutes  
**Level:** Intermediate to Advanced

#### What You'll Build
- Automated error detection and recovery in Jenkins pipelines
- Self-healing build and test stages
- Intelligent dependency resolution
- Self-healing orchestrator mode

#### Key Concepts
- Automated failure analysis
- Recovery pattern implementation
- Verification loops
- Fail-safe automation

#### Prerequisites
- Completed Labs 1-2 (PR Review and Unit Testing)
- Understanding of Jenkins pipelines
- Familiarity with Maven builds

#### Real-World Value
- **70-90% reduction** in mean time to recovery (MTTR)
- Fewer developer interruptions
- Automated handling of common failures
- Improved deployment confidence

---

### 2. MCP Server Development Lab
**File:** [`bob-mcp-server-development-CUSTOM.md`](bob-mcp-server-development-CUSTOM.md)  
**Duration:** ~60 minutes  
**Level:** Advanced

#### What You'll Build
- Custom MCP server for pipeline metrics
- Tools for querying build history
- Automated report generation
- Integration with Jenkins environment

#### Key Concepts
- MCP protocol in CI/CD context
- Server development with Node.js
- Container-based MCP servers
- Tool implementation patterns

#### Prerequisites
- Completed Lab 5 (DCR & Jira Reporting) or familiarity with MCP
- Basic Node.js knowledge
- Understanding of Jenkins pipelines

#### Real-World Value
- Extend Bob's capabilities to your infrastructure
- Automate metric collection and reporting
- Integrate with external systems
- Build team-specific tools

---

### 3. OpenShift Deployment Lab
**File:** [`bob-openshift-deployment-lab-CUSTOM.md`](bob-openshift-deployment-lab-CUSTOM.md)  
**Duration:** ~60 minutes  
**Level:** Advanced

#### What You'll Build
- Pre-deployment validation with Bob
- Automated container image builds
- OpenShift deployment orchestration
- Post-deployment verification
- Intelligent rollback automation

#### Key Concepts
- Deployment readiness validation
- Container security scanning
- OpenShift deployment patterns
- Health verification
- Automated rollback

#### Prerequisites
- Completed Labs 1-2 (PR Review and Unit Testing)
- Access to OpenShift cluster
- Understanding of containers and Kubernetes

#### Real-World Value
- **80% reduction** in deployment time
- **90% fewer** deployment failures
- Instant rollback capabilities
- Complete deployment audit trail

---

## How These Labs Integrate with the Workshop

### Workshop Flow

```
┌─────────────────────────────────────────────────────────┐
│              CORE WORKSHOP (Labs 1-5)                   │
│                                                         │
│  Lab 0: Setup                                           │
│  Lab 1: PR Review with Bob                             │
│  Lab 2: Unit Testing with Bob                          │
│  Lab 3: Security Scanning (if included)                │
│  Lab 4: Linting (if included)                          │
│  Lab 5: DCR & Jira Reporting                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│           HANDOFF LABS (Choose Your Path)               │
│                                                         │
│  Path A: Self-Healing → MCP Development                │
│  Path B: OpenShift Deployment → Self-Healing           │
│  Path C: MCP Development → OpenShift Deployment        │
│                                                         │
│  Or complete all three in any order!                   │
└─────────────────────────────────────────────────────────┘
```

### Reused Components

All three handoff labs build upon components from the core workshop:

| Component | From Lab | Used In Handoff Labs |
|-----------|----------|---------------------|
| `askBob` helper function | Lab 1 | All three labs |
| Custom modes system | Lab 1 | All three labs |
| Jenkins Pipeline Integration mode | Lab 1 | All three labs |
| Mode Writer mode | Lab 1 | All three labs |
| MCP configuration | Lab 5 | MCP Development Lab |
| Test analysis patterns | Lab 2 | Self-Healing Lab |
| Order-service application | All labs | All three labs |

### No Additional Setup Required

These labs are designed to work with the **exact same environment** as Labs 1-5:

- Same Jenkins instance
- Same OpenShift cluster
- Same Bob CLI containers
- Same workspace structure
- Same credentials and secrets

**You can start any handoff lab immediately after completing the core workshop!**

---

## Choosing Which Lab to Start With

### If You Want to Focus On...

**Reliability and Automation**
→ Start with **Self-Healing Lab**
- Learn to build resilient pipelines
- Automate recovery from common failures
- Reduce operational burden

**Extensibility and Integration**
→ Start with **MCP Development Lab**
- Learn to extend Bob's capabilities
- Build custom tools for your team
- Integrate with external systems

**Deployment and Operations**
→ Start with **OpenShift Deployment Lab**
- Learn deployment automation
- Build production-ready pipelines
- Implement rollback strategies

### Recommended Paths

**For SRE/DevOps Teams:**
1. OpenShift Deployment Lab
2. Self-Healing Lab
3. MCP Development Lab

**For Development Teams:**
1. Self-Healing Lab
2. MCP Development Lab
3. OpenShift Deployment Lab

**For Platform Teams:**
1. MCP Development Lab
2. OpenShift Deployment Lab
3. Self-Healing Lab

---

## Lab Structure

Each lab follows a consistent structure:

### 1. Overview
- What you'll build
- Learning objectives
- Why it matters
- Real-world impact

### 2. Understanding the Concepts
- Architecture diagrams
- Key concepts explained
- Bob's role in the workflow

### 3. Hands-On Exercises
- Step-by-step instructions
- Code examples
- Expected outputs
- Validation steps

### 4. Best Practices
- Production-ready patterns
- Security considerations
- Performance tips
- Common pitfalls

### 5. Troubleshooting
- Common issues and solutions
- Debug techniques
- Helpful commands

### 6. Key Takeaways
- Summary of learnings
- Real-world applications
- Next steps

---

## Time Estimates

### Individual Labs
- **Self-Healing Lab:** 45 minutes
- **MCP Development Lab:** 60 minutes
- **OpenShift Deployment Lab:** 60 minutes

### Combined Paths
- **All Three Labs:** 2.5-3 hours
- **Two Labs:** 1.5-2 hours
- **One Lab:** 45-60 minutes

### Recommended Schedule

**Half-Day Workshop Extension:**
- Morning: Complete core Labs 1-5
- Afternoon: Choose one handoff lab

**Full-Day Advanced Workshop:**
- Morning: Complete core Labs 1-5
- Afternoon: Complete 2-3 handoff labs

**Multi-Day Workshop:**
- Day 1: Core Labs 1-5
- Day 2: All three handoff labs

---

## Prerequisites Summary

### Technical Prerequisites
- ✅ Completed Lab 0 (Setup)
- ✅ Completed Labs 1-2 (minimum)
- ✅ Working Jenkins pipeline
- ✅ Access to OpenShift cluster
- ✅ Bob CLI configured

### Knowledge Prerequisites
- Understanding of Jenkins pipelines
- Familiarity with Git and version control
- Basic understanding of containers
- Knowledge of Maven builds (for Java labs)

### Optional Prerequisites
- Lab 5 completion (helpful for MCP Development Lab)
- Node.js knowledge (helpful for MCP Development Lab)
- Kubernetes/OpenShift experience (helpful for Deployment Lab)

---

## Support and Resources

### Getting Help

**During the Workshop:**
- Ask your instructor
- Check the troubleshooting sections
- Review the core lab materials

**After the Workshop:**
- [Bob Documentation](https://bob.ibm.com/docs)
- [Bob Custom Modes Guide](https://bob.ibm.com/docs/ide/configuration/custom-modes)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

### Additional Resources

**Core Workshop Materials:**
- [`labs/sre/`](../labs/sre/) - Core workshop labs
- [`setup/`](../setup/) - Setup instructions
- [`.bob/custom_modes.yaml`](../.bob/custom_modes.yaml) - Example modes

**Reference Implementations:**
- [`Jenkinsfile`](../Jenkinsfile) - Base pipeline
- [`order-service/`](../order-service/) - Sample application
- Solution Jenkinsfiles in `labs/sre/lab*/`

---

## Feedback and Contributions

These labs are designed to be practical and immediately applicable. If you have:

- **Suggestions for improvement**
- **Additional use cases to cover**
- **Questions or clarifications needed**
- **Success stories to share**

Please provide feedback to your workshop instructor or through your organization's feedback channels.

---

## Summary

These three custom handoff labs provide advanced, production-ready patterns for using Bob in CI/CD pipelines. They:

✅ Use only tools already installed in the workshop  
✅ Build upon core workshop concepts  
✅ Provide real-world, practical examples  
✅ Include complete, working code  
✅ Follow best practices for production use  
✅ Can be completed independently or together  

**Ready to get started?** Choose a lab above and dive in!

---

## Quick Start

1. **Ensure you've completed Labs 1-2** (minimum)
2. **Choose a handoff lab** based on your interests
3. **Open the lab file** and follow the instructions
4. **Use your existing Jenkins pipeline** and workspace
5. **Build, test, and learn!**

Happy learning! 🚀