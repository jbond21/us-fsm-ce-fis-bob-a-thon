# Lab 4 — Linting and Compliance with Bob

## Table of Contents

- [Overview of Lab 4](#overview-of-lab-4)
  - [What you'll build in Lab 4](#what-youll-build-in-lab-4)
  - [What you'll reuse from earlier labs](#what-youll-reuse-from-earlier-labs)
- [Before you start](#before-you-start)
- [Part 1 — Warm up in the IDE with SonarLint and Bob](#part-1--warm-up-in-the-ide-with-sonarlint-and-bob)
- [Part 2 — Inspect the provided pipeline lint targets in the IDE](#part-2--inspect-the-provided-pipeline-lint-targets-in-the-ide)
- [Part 3 — Create the `iac-lint-fix-advisor` IDE mode](#part-3--create-the-iac-lint-fix-advisor-ide-mode)
- [Part 4 — Use the mode to improve one or two findings locally](#part-4--use-the-mode-to-improve-one-or-two-findings-locally)
- [Part 5 — Create the `pipeline-lint-reporter` mode](#part-5--create-the-pipeline-lint-reporter-mode)
- [Part 6 — Build the linting stages in Jenkins](#part-6--build-the-linting-stages-in-jenkins)
- [Part 7 — Push and watch](#part-7--push-and-watch)
- [Part 8 — Optional: post a Bob-generated lint summary to GitHub from the IDE](#part-8--optional-post-a-bob-generated-lint-summary-to-github-from-the-ide)
- [Stuck?](#stuck)

---

## Overview of Lab 4

You'll add a multi-tool linting and compliance workflow to the pipeline using the same prompt-then-mode loop you practiced in the earlier labs.

This lab intentionally combines an IDE warm-up with three pipeline scanners:

- [SonarLint](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode) in the IDE for immediate Java findings
- [Hadolint](https://github.com/hadolint/hadolint) in the pipeline for [`order-service/Dockerfile`](order-service/Dockerfile)
- [Checkov](https://www.checkov.io/) in the pipeline for the deployment manifests under [`order-service/deploy-flawed/`](order-service/deploy-flawed)
- [KubeLinter](https://docs.kubelinter.io/) in the pipeline for Kubernetes workload best practices in [`order-service/deploy-flawed/`](order-service/deploy-flawed)

Instead of making every learner invent their own manifests, this repo includes slightly flawed deployment files with predictable findings. That keeps the lab focused on Bob’s strengths:

- interpreting SonarLint findings in the IDE
- anticipating likely pipeline findings before Jenkins runs
- analyzing real lint output in CI
- recommending fixes
- producing a consolidated lint report
- preparing a PR-comment-ready summary

### What you'll build in Lab 4

1. **An IDE warm-up with SonarLint and Bob** — immediate feedback on the Java code without waiting for the pipeline.

2. **An IDE-side Bob mode for lint remediation** (`iac-lint-fix-advisor`) — a mode that reads the Dockerfile and deployment manifests, predicts likely pipeline findings, and helps propose minimal fixes.

3. **A pipeline Bob mode for lint reporting** (`pipeline-lint-reporter`) — a read-only mode that reads the raw output from multiple linters and turns it into a Jenkins-friendly report.

4. **A new set of pipeline stages** — one stage runs the linters, one stage asks Bob to summarize the results, and one stage posts a condensed comment to the PR.

5. **A final Bob-enriched lint report** — archived in Jenkins as a build artifact and summarized in the PR.

By the end, Jenkins will not just say that linting found problems — Bob will explain what matters, which issues overlap across tools, what to fix first, and how to remediate them.

### What you'll reuse from earlier labs

- **The [`askBob()`](labs/sre/lab1/Jenkinsfile.lab1solution:153) helper** — already in your Jenkinsfile from Lab 1.
- **The Jenkins Pipeline Integration workflow** — the same prompt style you used in earlier labs to add stages to [`Jenkinsfile`](Jenkinsfile).
- **The custom-mode pattern** — one mode for IDE work, one read-only mode for pipeline output.

---

## Before you start

- [ ] Lab 2 complete at minimum (your Jenkinsfile already has [`askBob()`](labs/sre/lab1/Jenkinsfile.lab1solution:153))
- [ ] You're on your working branch (for example `user1-labs`)
- [ ] The workshop environment includes the dedicated `lint-tools` image described in [`setup/LINT_TOOLS_SETUP.md`](setup/LINT_TOOLS_SETUP.md)
- [ ] Recommended VS Code extensions are installed:
  - [SonarLint](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode)
  - Java support such as the [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack)

> **Important:** This lab assumes the Jenkins agent pod can use a `lint-tools` container with Hadolint, Checkov, and KubeLinter preinstalled.

> **Optional:** [`order-service/pom.xml`](order-service/pom.xml) already includes [Checkstyle](https://checkstyle.sourceforge.io/) configuration. You can mention it as an extra Java-linting path, but it is not part of the core SRE lab flow.

---

## Part 1 — Warm up in the IDE with SonarLint and Bob

Before touching the pipeline, start in the IDE with Java-focused findings that appear immediately.

Open a few Java files such as:

- [`order-service/src/main/java/com/example/orders/service/OrderService.java`](order-service/src/main/java/com/example/orders/service/OrderService.java)
- [`order-service/src/main/java/com/example/orders/controller/OrderController.java`](order-service/src/main/java/com/example/orders/controller/OrderController.java)

With [SonarLint](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode) and Java support enabled, look at the Problems panel and any inline warnings the IDE surfaces.

Then start a new task and switch to **Ask** mode. Try prompts like:

```text
Read @order-service/src/main/java/com/example/orders/service/OrderService.java.
I am seeing SonarLint findings in the IDE. What kinds of issues is SonarLint likely flagging here, which ones matter most, and what would you recommend fixing first?
```

Or:

```text
Read @order-service/src/main/java/com/example/orders/controller/OrderController.java and @order-service/src/main/java/com/example/orders/service/OrderService.java.
Give me an SRE-friendly explanation of the most important SonarLint-style findings and why they still matter even though this lab is focused on pipeline linting.
```

This warm-up gives users immediate feedback in the IDE without installing extra command-line linters on their laptop.

The point is not to turn the lab into a Java developer lab. The point is to let users:

- see findings right away in the IDE
- ask Bob to interpret and prioritize them
- get comfortable with Bob’s recommendation style before moving into the pipeline-only lint tools

After this warm-up, the lab shifts to the SRE-focused pipeline tools: [Hadolint](https://github.com/hadolint/hadolint), [Checkov](https://www.checkov.io/), and [KubeLinter](https://docs.kubelinter.io/).

---

## Part 2 — Inspect the provided pipeline lint targets in the IDE

Before writing any pipeline code, use Bob in the IDE to inspect the files that the pipeline linters will scan:

- [`order-service/Dockerfile`](order-service/Dockerfile)
- [`order-service/deploy-flawed/deployment.yaml`](order-service/deploy-flawed/deployment.yaml)
- [`order-service/deploy-flawed/service.yaml`](order-service/deploy-flawed/service.yaml)
- [`order-service/deploy-flawed/route.yaml`](order-service/deploy-flawed/route.yaml)

Start a new task and switch to **Ask** mode. Try a prompt like:

```text
Read @order-service/Dockerfile and the manifests under @order-service/deploy-flawed/.
What issues are likely to be flagged by Hadolint, Checkov, or KubeLinter?
Group them by file and explain which ones are most important to fix first.
```

This gives you immediate Bob-driven feedback before Jenkins is involved.

You should see Bob point out issues such as:

- use of `latest` in container images
- plaintext secrets or credentials in env vars
- missing probes
- missing resource requests and limits
- weak or incomplete `securityContext`
- overly permissive route or service settings

That prediction step is useful for two reasons:

1. it helps you understand what the pipeline scanners are likely to find
2. it gives you a baseline to compare with the actual lint output later

---

## Part 3 — Create the `iac-lint-fix-advisor` IDE mode

Now create a reusable IDE mode that specializes in lint remediation for Dockerfiles and Kubernetes/OpenShift manifests.

Start a new task and switch to **Mode Writer** mode.

Use this as a starter prompt:

```text
Write a custom mode with slug `iac-lint-fix-advisor`. Append it to @.bob/custom_modes.yaml — don't overwrite anything else.

Job: help improve Dockerfiles and Kubernetes/OpenShift deployment manifests for this repo.
Before making edits, read the existing files under @order-service/ and match the repo's style.
Focus on:
- Hadolint findings in @order-service/Dockerfile
- Checkov findings in @order-service/deploy-flawed/
- KubeLinter findings in @order-service/deploy-flawed/

When asked to fix findings:
- explain the issue briefly
- suggest the smallest reasonable remediation
- keep the changes realistic for a workshop app
- avoid overengineering
- preserve readability

Tool groups:
- read
- edit

Add instruction files in Markdown if needed.
```

Once Bob creates the mode, restart the IDE if needed so the new mode appears.

---

## Part 4 — Use the mode to improve one or two findings locally

In a new task, switch to your new **IAC Lint Fix Advisor** mode.

Ask Bob to improve one or two issues in the provided files. For example:

```text
Read @order-service/Dockerfile and @order-service/deploy-flawed/deployment.yaml.
Pick the two highest-value findings and fix them with minimal changes.
Explain what you changed and why.
```

You are not trying to eliminate every single finding in the IDE. The goal is to:

- practice using a specialized remediation mode
- understand how the findings map back to real files
- see Bob make targeted improvements before the pipeline exists

After Bob makes the changes, you can ask in **Ask** mode:

```text
Summarize which likely lint findings remain in @order-service/Dockerfile and @order-service/deploy-flawed/.
```

You can also ask Bob to connect the IDE warm-up to the pipeline-focused files:

```text
Compare the SonarLint-style issues we discussed in the Java code with the likely pipeline findings in @order-service/Dockerfile and @order-service/deploy-flawed/.
What themes show up across both, and which issues would you prioritize first from an SRE perspective?
```

That gives you a before-and-after comparison while keeping the command-line lint execution in Jenkins, where it belongs for this lab.

---

## Part 5 — Create the `pipeline-lint-reporter` mode

Your IDE mode is good for making fixes. The pipeline needs something different: a read-only mode that can synthesize raw lint output from multiple tools and turn it into a concise report.

Start a new task and switch to **Mode Writer** mode again.

Use this starter prompt:

```text
Write a custom mode with slug `pipeline-lint-reporter`. Append it to @.bob/custom_modes.yaml — don't overwrite anything else.

Job: read lint output from Hadolint, Checkov, and KubeLinter, plus the relevant source files under @order-service/.
Produce a short Jenkins-friendly report that:
- groups findings by severity
- identifies overlap across tools
- names the most important fix-first items
- suggests concrete remediations
- stays concise and practical

Output: plain text or Markdown suitable for a Jenkins artifact and easy to summarize in a PR comment.
Use sections:
- Executive Summary
- Highest Priority Findings
- Findings by Tool
- Cross-Tool Themes
- Recommended Fix Order

If findings are duplicated across tools, call that out instead of repeating the same issue many times.

Tool groups: read only.
```

This mode will do the heavy lifting in the pipeline.

---

## Part 6 — Build the linting stages in Jenkins

Start a new task and switch to the provided **Jenkins Pipeline Integration** mode.

Ask Bob to update [`Jenkinsfile`](Jenkinsfile) with a lint workflow after the earlier stages.

Use a prompt like:

```text
Update @Jenkinsfile to add linting and reporting stages after the existing earlier lab stages.

Requirements:
- Add a `lint-tools` container to the Kubernetes agent pod YAML using the workshop lint image
- Run Hadolint on @order-service/Dockerfile
- Run Checkov on @order-service/deploy-flawed/
- Run KubeLinter on @order-service/deploy-flawed/
- Save each tool's output into a `lint-results/` directory in the workspace
- Continue the pipeline even if the linters find issues
- Call askBob with the `pipeline-lint-reporter` mode to analyze the raw lint outputs and the relevant files under @order-service/
- Save the full analysis to `bob-lint-report.md`
- Save a condensed PR comment body to `bob-lint-pr-comment.md`
- Archive the lint outputs and Bob-generated report files
- Print a short summary to the console
- Post the PR comment to GitHub using a Jenkins-provided token
```

### Recommended stage shape

A good implementation will usually split the work into stages such as:

- `Run Linters`
- `Bob Lint Analysis`
- `Post Lint PR Comment`

### Recommended output files

Your pipeline should produce files like:

- `lint-results/hadolint.txt`
- `lint-results/checkov.txt`
- `lint-results/kubelinter.txt`
- `bob-lint-report.md`
- `bob-lint-pr-comment.md`

### Important design pattern

The linters should run in [`container('lint-tools')`](labs/sre/lab4/Jenkinsfile.lab4solution), and the Bob analysis should run through [`askBob()`](labs/sre/lab1/Jenkinsfile.lab1solution:153).

Jenkins should orchestrate:

- running the tools
- saving files
- archiving artifacts
- posting the PR comment

Bob should do the interpretation:

- grouping findings
- prioritizing fixes
- suggesting remediation
- generating the report text

---

## Part 6 — Push and watch

Once your Jenkinsfile and mode definitions are ready:

```bash
git add Jenkinsfile .bob/ order-service/deploy-flawed/
git commit -m "Lab 4 — linting and compliance with Bob"
git push
```

In Jenkins, click **Build Now** and watch the pipeline.

Expected behavior:

- earlier stages still run
- the lint stage runs inside the `lint-tools` container
- raw outputs are written under `lint-results/`
- Bob prints a short summary in the console
- [`bob-lint-report.md`](labs/sre/lab4/bob-lint-report.md) is archived as a build artifact
- the pipeline posts a condensed lint summary comment to the PR
- the build may end **UNSTABLE** if findings exist, but should still complete

When you open the artifact, you should see a consolidated report that is far more useful than the raw scanner output alone.

---

## Part 7 — Optional: post a Bob-generated lint summary to GitHub from the IDE

If your Bob IDE is configured with the GitHub MCP server, you can also demonstrate the report workflow before Jenkins runs.

Suggested flow:

1. Generate or refine a lint summary in the IDE using Bob.
2. Switch to **Advanced** mode.
3. Ask Bob to post the summary as a PR comment using the GitHub MCP server.

For example:

```text
Read @bob-lint-pr-comment.md and post it as a comment to my current pull request using the GitHub MCP server.
```

This is optional and intentionally separate from the Jenkins path. The core lab should still work even if GitHub MCP is not configured in the IDE.

---

## Stuck?

- **The `lint-tools` container is missing.** The workshop environment may not have been prepared for the lint lab yet. Follow [`setup/LINT_TOOLS_SETUP.md`](setup/LINT_TOOLS_SETUP.md) and ensure the pod YAML in [`Jenkinsfile`](Jenkinsfile) includes the `lint-tools` container.
- **Hadolint, Checkov, or KubeLinter fail with `command not found`.** The image was built incorrectly or the wrong image is referenced in the Jenkins pod YAML. Verify the image from [`setup/lint-tools/Dockerfile`](setup/lint-tools/Dockerfile) was pushed and is being used.
- **The linters fail the build before Bob can analyze anything.** Wrap the lint command block in `catchError` or use `|| true` so output files are still written and Bob can read them.
- **Checkov output is huge and noisy.** Narrow the scan target to [`order-service/deploy-flawed/`](order-service/deploy-flawed) rather than the whole repo.
- **KubeLinter reports nothing useful.** Make sure you are linting the deployment manifests, especially [`order-service/deploy-flawed/deployment.yaml`](order-service/deploy-flawed/deployment.yaml).
- **Bob's report repeats the same issue three times.** Refine the `pipeline-lint-reporter` mode so it explicitly de-duplicates overlapping findings across tools.
- **The PR comment step fails.** Check that Jenkins has the expected GitHub PAT credential configured and that your pipeline knows the PR number or can discover it from the job context.
- **`Jenkinsfile` not working?** Use the reference solution in [`labs/sre/lab4/Jenkinsfile.lab4solution`](labs/sre/lab4/Jenkinsfile.lab4solution) as your reset point once it is available in the repo.

---

When you're ready, continue to [`labs/sre/lab5/LAB5_DCR_JIRA.md`](labs/sre/lab5/LAB5_DCR_JIRA.md).