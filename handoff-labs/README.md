# FIS Bob-a-thon Handoff Labs

Welcome to the advanced handoff labs for the FIS Bob-a-thon workshop! These labs extend the concepts from the core workshop (Labs 1-5) into production-ready CI/CD scenarios.

---

## 🎯 Quick Start

**Prerequisites:** Complete Labs 1-2 (minimum) from the core workshop

**Choose Your Lab:**

1. **[Auto-Recovery and Self-Healing](bob-auto-recovery-self-healing-lab.md)** (~45 min)
   - Build pipelines that automatically detect and fix common failures
   - Implement self-healing build and test stages
   - Create intelligent recovery workflows

2. **[MCP Server Development](bob-mcp-server-development.md)** (~60 min)
   - Create custom MCP servers for pipeline operations
   - Build tools that extend Bob's capabilities
   - Integrate with Jenkins and external systems

3. **[OpenShift Deployment Automation](bob-openshift-deployment-lab.md)** (~60 min)
   - Automate container builds and deployments
   - Implement pre-deployment validation
   - Build intelligent rollback capabilities

---

## 📚 What Are Handoff Labs?

Handoff labs are **advanced, standalone exercises** that demonstrate real-world applications of Bob in production CI/CD pipelines. They:

✅ Use **only the tools already installed** in your workshop environment  
✅ Build upon concepts from Labs 1-5  
✅ Provide **production-ready patterns**  
✅ Include complete, working code examples  
✅ Can be completed **independently or together**  

---

## 🛠️ What's Already Set Up

These labs work with your existing workshop infrastructure:

- ✅ Jenkins with Kubernetes agents
- ✅ OpenShift cluster with `oc` CLI
- ✅ Bob CLI in containers
- ✅ Maven 3.9 with JDK 17
- ✅ Order-service Spring Boot application
- ✅ Custom modes system
- ✅ MCP server support

**No additional setup required!**

---

## 🗺️ Recommended Paths

### For SRE/DevOps Teams
1. OpenShift Deployment Lab
2. Self-Healing Lab
3. MCP Development Lab

### For Development Teams
1. Self-Healing Lab
2. MCP Development Lab
3. OpenShift Deployment Lab

### For Platform Teams
1. MCP Development Lab
2. OpenShift Deployment Lab
3. Self-Healing Lab

---

## 📖 Lab Details

### 1. Auto-Recovery and Self-Healing Lab
**File:** [`bob-auto-recovery-self-healing-lab.md`](bob-auto-recovery-self-healing-lab.md)  
**Duration:** ~45 minutes  
**Level:** Intermediate to Advanced

**What You'll Learn:**
- Automated error detection and recovery
- Self-healing build and test stages
- Intelligent dependency resolution
- Recovery orchestration patterns

**Real-World Value:**
- 70-90% reduction in MTTR
- Fewer developer interruptions
- Automated handling of common failures

---

### 2. MCP Server Development Lab
**File:** [`bob-mcp-server-development.md`](bob-mcp-server-development.md)  
**Duration:** ~60 minutes  
**Level:** Advanced

**What You'll Learn:**
- MCP protocol in CI/CD context
- Building custom MCP servers with Node.js
- Creating pipeline-specific tools
- Container-based MCP deployment

**Real-World Value:**
- Extend Bob to your infrastructure
- Automate metric collection
- Integrate with external systems

---

### 3. OpenShift Deployment Lab
**File:** [`bob-openshift-deployment-lab.md`](bob-openshift-deployment-lab.md)  
**Duration:** ~60 minutes  
**Level:** Advanced

**What You'll Learn:**
- Pre-deployment validation with Bob
- Automated container builds
- OpenShift deployment orchestration
- Post-deployment verification
- Intelligent rollback automation

**Real-World Value:**
- 80% reduction in deployment time
- 90% fewer deployment failures
- Instant rollback capabilities

---

## ⏱️ Time Estimates

- **One Lab:** 45-60 minutes
- **Two Labs:** 1.5-2 hours
- **All Three Labs:** 2.5-3 hours

---

## 🎓 Prerequisites

### Technical Prerequisites
- ✅ Completed Lab 0 (Setup)
- ✅ Completed Labs 1-2 (minimum)
- ✅ Working Jenkins pipeline
- ✅ Access to OpenShift cluster

### Knowledge Prerequisites
- Understanding of Jenkins pipelines
- Familiarity with Git and version control
- Basic understanding of containers
- Knowledge of Maven builds

---

## 🆘 Getting Help

**During the Workshop:**
- Ask your instructor
- Check the troubleshooting sections in each lab
- Review the core lab materials

**After the Workshop:**
- [Bob Documentation](https://bob.ibm.com/docs)
- [Bob Custom Modes Guide](https://bob.ibm.com/docs/ide/configuration/custom-modes)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

---

## 📁 Files in This Directory

- **`bob-auto-recovery-self-healing-lab.md`** - Self-healing pipeline lab
- **`bob-mcp-server-development.md`** - MCP server development lab
- **`bob-openshift-deployment-lab.md`** - OpenShift deployment lab
- **`README-CUSTOM-LABS.md`** - Detailed guide about customizations
- **`*-ORIGINAL.md`** - Original lab versions (for reference)

---

## 🚀 Ready to Start?

1. **Choose a lab** based on your interests and role
2. **Open the lab file** and follow the step-by-step instructions
3. **Use your existing Jenkins pipeline** from the core workshop
4. **Build, test, and learn!**

For more details about how these labs were customized for your environment, see [`README-CUSTOM-LABS.md`](README-CUSTOM-LABS.md).

---

**Happy learning!** 🎉