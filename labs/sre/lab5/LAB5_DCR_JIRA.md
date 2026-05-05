# Lab 5 — DCR Generation + Jira MCP Reporting with Bob

## Table of Contents

- [Overview of Lab 5](#overview-of-lab-5)
  - [What you'll build in Lab 5](#what-youll-build-in-lab-5)
  - [What you'll reuse from Labs 1 & 2](#what-youll-reuse-from-labs-1--2)
- [Before you start](#before-you-start)
- [Part 1 — Register the Jira MCP server in `.bob/mcp.json`](#part-1--register-the-jira-mcp-server-in-bobmcpjson)
  - [Key characteristics of this MCP registration](#key-characteristics-of-this-mcp-registration)
  - [Edit `.bob/mcp.json` directly](#edit-bobmcpjson-directly)
- [Part 2 — Create the `pipeline-dcr-jira-reporter` custom mode](#part-2--create-the-pipeline-dcr-jira-reporter-custom-mode)
  - [Key characteristics of this mode](#key-characteristics-of-this-mode)
- [Part 3 — Add the `DCR` stage to your Jenkinsfile](#part-3--add-the-dcr-stage-to-your-jenkinsfile)
- [Part 4 — Push and watch](#part-4--push-and-watch)
- [Part 5 — Make it idempotent (optional)](#part-5--make-it-idempotent-optional)
- [Stuck?](#stuck)

---

## Overview of Lab 5

Lab 5 is the most involved lab in the workshop. You'll do three things at once: generate a **Deployment Change Request (DCR)** report from the branch, wire **Bob up to a Jira MCP server** so it can act on that report, and add a `DCR` stage to your Jenkinsfile that ties them together.

Up to this point, every Bob mode you've created has been a **read-only analyst** — Bob looks at code/tests/diffs and writes a summary. In this lab Bob actually **does something with an external system**. The mechanism is [MCP (Model Context Protocol)](https://modelcontextprotocol.io): Bob talks to a Jira server through a small adapter process declared in `.bob/mcp.json`, and the custom mode you write tells Bob which Jira tools it's allowed to call.

### What you'll build in Lab 5

1. **A Jira MCP server registration** in `.bob/mcp.json` — declarative config that Bob's pipeline pod picks up at startup. No Jenkins UI changes, no image rebuild.

2. **A custom Bob mode for DCR + Jira reporting** (`pipeline-dcr-jira-reporter`) — a pipeline mode with the `mcp` tool group enabled and a tight `alwaysAllow` list of Jira tools so the mode can file the DCR without prompting for approval mid-build.

3. **A `DCR` stage** in your Jenkinsfile — runs after Unit Tests, gathers the change material (commits since `main`, diff stats, test results, artifacts from earlier stages), hands it to Bob in the new mode, and Bob both writes a `deployment-change-request.md` artifact **and** creates a new Jira ticket containing the DCR.

By the end, every push produces a structured DCR in Jenkins **and** a fresh Jira ticket your release manager can act on — without anyone copy-pasting between tools.

### What you'll reuse from Labs 1 & 2

- **The `askBob` helper function** — same call pattern, just a new mode slug.
- **The `jenkins-bob-integration` mode** — you'll use this in your IDE to write the DCR stage.
- **Earlier-stage artifacts** — the DCR mode can read `bob-pr-review.md` and `bob-test-analysis.md` from the workspace if you want the report to roll up the rest of the pipeline's findings.

---

## Before you start

- [ ] Labs 1 and 2 complete (PR Review + Unit Tests stages already in your Jenkinsfile)
- [ ] You're on your working branch (e.g. `user1-labs`)
- [ ] **Your instructor has provisioned the Jira credential set in the `jenkins` namespace.** The `bob-cli` sidecar needs `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN`, and `JIRA_PROJECT` injected as env vars (same `secretKeyRef` pattern as `BOBSHELL_API_KEY`). The first three authenticate the MCP server; the fourth tells the mode which project to file tickets in (e.g. `BOBA`). If those env vars aren't present in the pod, the MCP server will start but every Jira call will 401, or the create call will fail because no project was specified. If you don't know whether this has been done, ask your instructor before pushing.
- [ ] **The `bob-cli` image has `uv`/`uvx` installed.** The instructor's `setup/bob-cli/Dockerfile` ships Node only by default. The `mcp-atlassian` server is a Python package launched via `uvx`, so the image needs `uv` added (one extra line in the Dockerfile + a rebuild). If your instructor hasn't done this yet, the MCP block you write in Part 1 will cause the bob container to log `uvx: command not found` the first time the mode tries to use the server.

> **Why this lab needs more environment setup than Labs 1–2.** The earlier labs only needed Bob to read files. This one needs Bob to **call out to a network service with credentials** — that's the cost of doing real work in a CI environment. Once the secret + image plumbing is in place, every future MCP server you add (GitHub, Confluence, ServiceNow, Slack…) follows the same pattern.

---

## Part 1 — Register the Jira MCP server in `.bob/mcp.json`

`.bob/mcp.json` currently exists with an empty `mcpServers` object. Bob loads this file from the workspace exactly the same way it loads `custom_modes.yaml` — fresh on every pipeline run, no rebuild required. Adding a server here is purely a content change on your branch.

You may already have a Jira MCP server configured for your IDE in your personal settings — most participants do, and it usually looks like this:

```json
"atlassian": {
  "command": "uvx",
  "args": ["mcp-atlassian"],
  "env": {
    "JIRA_URL": "${JIRA_URL}",
    "JIRA_USERNAME": "${JIRA_USERNAME}",
    "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
  },
  "disabled": false,
  "alwaysAllow": ["jira_get_issue", "jira_search", "jira_add_comment", "..."]
}
```

The pipeline config is intentionally **almost identical** to the IDE config — same package, same env var names, same shape. The thing to be aware of is that Bob CLI sometimes needs a fully-qualified path to the launcher (`uvx`, `npx`, etc.) when the IDE config can rely on PATH resolution. In our pod the bob image installs `uv` to a known path, so `"command": "uvx"` works without a full path — but if you ever see `command not found` errors on a different cluster, this is the first thing to fix.

### Key characteristics of this MCP registration:

- **Server name**: `atlassian` (this is the string the mode's `alwaysAllow` list and any explicit `mcp__atlassian__*` tool calls reference — pick it carefully, renaming later means touching multiple files)
- **Transport**: `stdio` (the default — `uvx` launches the server as a subprocess of bob)
- **Credentials**: Pulled from the bob container's environment, **not** baked into `mcp.json`. The `${VAR}` syntax means Bob expands the value at startup from whatever is set in the pod
- **`disabled: false`**: explicit because the file is committed to git and a future maintainer reading it shouldn't have to guess
- **`alwaysAllow` list**: kept short and scoped to what this lab actually does — one create call plus a couple of read calls for sanity checks. Pipeline modes shouldn't be transitioning issues, deleting things, or commenting in bulk without an explicit prompt — that's a footgun in CI

### Edit `.bob/mcp.json` directly

Open the file (it's currently `{"mcpServers":{}}`) and replace it with:

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
        "jira_create_issue",
        "jira_get_issue",
        "jira_get_all_projects"
      ]
    }
  }
}
```

> **Why such a short `alwaysAllow` list?** Anything in this list runs **without confirmation** in the pipeline pod. `jira_create_issue` is the only mutation we need for this lab — it's how the DCR lands in Jira. `jira_get_all_projects` lets the mode confirm `JIRA_PROJECT` actually exists before trying to create against it (a clearer error than "400 Bad Request"). `jira_get_issue` lets the mode optionally re-fetch the freshly-created ticket so it can echo the new key/URL into the Jenkins console. **Avoid** putting `jira_transition_issue`, `jira_update_issue`, `jira_delete_issue`, or anything that can move or remove tickets in here without thinking hard about blast radius. Anything not in `alwaysAllow` will require the model's tool call to surface a prompt that nobody is around to answer in a CI run, so the Jira write effectively no-ops — which is sometimes what you want. Treat this list as the contract.

> **Why no `cwd` field like the screenshot in the spec docs?** The IBM `ibmi-mcp-server` example sets a fully-qualified `cwd` because it reads tool definitions from a local path on the user's laptop. `mcp-atlassian` is self-contained — it talks to the Jira REST API and needs no project-local files. Skip `cwd` here; adding it just makes the config brittle when the workspace path changes.

No push yet — nothing reads `mcp.json` until a mode declares it can use MCP.

---

## Part 2 — Create the `pipeline-dcr-jira-reporter` custom mode

The MCP registration is just plumbing. The **behavior** comes from a custom mode that (a) knows how to assemble a DCR from pipeline outputs and (b) is allowed to talk to the Jira MCP server.

### Key characteristics of this mode:

- **Purpose**: Generate a Deployment Change Request from the branch's commits, diff, test results, and earlier Bob analyses, then file that report as a new Jira ticket
- **Permissions**: `read` + `mcp` (no `edit` — the mode shouldn't be modifying source code; the DCR file itself is written by the pipeline stage with `writeFile`)
- **MCP scope**: Only the `atlassian` server, only the tools listed in `alwaysAllow`. The mode should **never** invent tool calls outside that list
- **Output format**: Plain markdown DCR with a fixed section structure (Summary, Changes, Risk, Test Results, Rollback Plan, Reviewer Notes) so the artifact is consistent build-to-build and easy for downstream tooling to parse
- **Jira behavior**: Always create a new ticket in the project named by `JIRA_PROJECT` (read from `dcr-context.txt`). One ticket per build — no commenting, no looking for prior tickets. The ticket title and labels follow a strict convention so 5 students sharing one Jira project can find their own tickets at a glance
- **No IDE restart needed**: pipeline modes are loaded fresh from the workspace on each run

Start a new task and switch to the built-in **Mode Writer** mode. Paste this as a starting prompt, or write your own:

```
Write me a custom mode called pipeline-dcr-jira-reporter. The slug should be exactly: pipeline-dcr-jira-reporter.

The mode's job is to generate a Deployment Change Request (DCR) for a Jenkins pipeline run and then file that report as a brand-new Jira ticket via the atlassian MCP server.

Inputs the mode should expect to find in the workspace at invocation time:
  - The git branch's commit history and diff (the pipeline stage will pre-compute these into files: dcr-commits.txt and dcr-diffstat.txt)
  - bob-pr-review.md (from the Lab 1 PR Review stage), if present
  - bob-test-analysis.md (from the Lab 2 Unit Tests stage), if present
  - A short context file (dcr-context.txt) the pipeline writes containing three KEY=VALUE lines:
      BUILD_NUMBER=<jenkins build number>
      BRANCH=<branch name, e.g. user1-labs>
      JIRA_PROJECT=<the project key to create the ticket in, e.g. BOBA>

Output:
  1. Write a markdown DCR to deployment-change-request.md with these sections (in this order):
     - Summary — one paragraph, what is being deployed and why
     - Changes — bullet list grouped by area (api, db, config, infra, deps)
     - Risk Assessment — high/medium/low with rationale, pulling from bob-pr-review.md if it exists
     - Test Results — pass/fail summary, pulling from bob-test-analysis.md if it exists
     - Rollback Plan — concrete steps, not "revert the commit"
     - Reviewer Notes — what the reviewer should look at first
  2. After writing the file, file the DCR as a new Jira ticket:
     - Use jira_create_issue against the project named by JIRA_PROJECT in dcr-context.txt
     - Issue type: Task
     - Summary (title): exactly "DCR: <BRANCH> build #<BUILD_NUMBER>" (substitute the values from dcr-context.txt)
     - Description: the full contents of deployment-change-request.md
     - Labels: ["bob-dcr", "<BRANCH>"] — the branch name as a label is how students filter the shared board to just their own tickets. If the branch name contains characters Jira labels don't allow (spaces, slashes), sanitize by replacing them with hyphens
     - After create, log the new ticket key and URL to the console so it's easy to find from the Jenkins build page

Tool groups:
  - read
  - mcp (restricted to the atlassian server, with the alwaysAllow tools defined in .bob/mcp.json: jira_create_issue, jira_get_issue, jira_get_all_projects)

Output constraints:
  - Plain markdown, readable in Jenkins console as plain text (no HTML, no fancy tables)
  - Section headers are H2 (##) so the document parses cleanly
  - Total document length capped — this is a release artifact, not a novel. Aim for under 200 lines

Add a rules directory for this mode with XML files describing:
  - The required DCR section structure
  - The exact ticket title and label format (this is a hard contract — Part 5 of the lab depends on the per-branch label being present)
  - When to call which Jira MCP tool (jira_get_all_projects once to confirm JIRA_PROJECT exists; jira_create_issue exactly once; optionally jira_get_issue on the returned key to confirm and log the URL)
  - Defensive behavior when the MCP server is unreachable or jira_create_issue fails: write the DCR to disk anyway and log the Jira failure clearly, do not fail the pipeline. The DCR artifact must always be archived even if Jira is down.

Append the new mode to the bottom of the existing @.bob/custom_modes.yaml file — do not overwrite anything.
```

Watch Bob work and provide input where it helps. Pay particular attention to three things in what Mode Writer produces:

1. **The `mcp` group declaration** — it should reference the `atlassian` server explicitly and not grant blanket MCP access. If the generated YAML has `groups: [read, mcp]` without scoping, edit it to scope down before saving.
2. **The title and label format** — this is a hard contract. Title `DCR: <BRANCH> build #<N>` and labels `["bob-dcr", "<BRANCH>"]` are how students find their own tickets on a shared board, and how Part 5 (if you do it) finds prior tickets. Don't let Mode Writer get creative here.
3. **The "create exactly once" rule** — the mode should not loop, retry, or create a second ticket if the first call partially succeeds. If create fails, log and move on; the DCR file on disk is the source of truth.

Since you won't be invoking this mode from the IDE, **no need to restart Bob IDE**. The pipeline pod reads `.bob/custom_modes.yaml` and `.bob/mcp.json` together at the start of each build.

---

## Part 3 — Add the `DCR` stage to your Jenkinsfile

Ensure you have restarted Bob IDE so the `jenkins-bob-integration` mode from Lab 1 still appears in your dropdown.

Start a new task and switch to the **Jenkins Bob Integration** mode. Write your own prompt that asks Bob to do all of the following:

- Add a new stage called **`DCR`** to `@Jenkinsfile` that runs **after** `Unit Tests` (so it has access to the test analysis artifact) and is the **last** stage before the global `post` block.
- Before any git command in the stage, configure git's `safe.directory` for the workspace (same `git config --global --add safe.directory "$WORKSPACE"` line as Lab 1).
- Gather the change material into the workspace as **plain relative-path files** Bob can read:
  - `dcr-commits.txt` — output of `git log origin/main..HEAD --pretty=format:'%h %s'`
  - `dcr-diffstat.txt` — output of `git diff origin/main...HEAD --stat`
  - `dcr-context.txt` — a short text file containing exactly three lines:
    ```
    BUILD_NUMBER=${BUILD_NUMBER}
    BRANCH=${BRANCH_NAME}
    JIRA_PROJECT=${JIRA_PROJECT}
    ```
    `JIRA_PROJECT` comes from the env var the instructor injected alongside `JIRA_URL` / `JIRA_USERNAME` / `JIRA_API_TOKEN`. If `BRANCH_NAME` isn't set in your Jenkins setup, use whatever env var holds the branch (e.g., `GIT_BRANCH` with the `origin/` prefix stripped).
- Make all three of those `sh` invocations resilient — fall back to empty files rather than failing the stage if the git command produces no output (same pattern as Lab 1's diff handling).
- Call the `askBob` helper with the mode `pipeline-dcr-jira-reporter` and a short prompt instructing Bob to read `dcr-commits.txt`, `dcr-diffstat.txt`, `dcr-context.txt`, and (if present) `bob-pr-review.md` and `bob-test-analysis.md`, then produce the DCR per the mode's rules and file the new Jira ticket.
- Capture `askBob`'s return value into a local variable.
- Print the analysis between banner lines in the Jenkins console (same banner pattern as Lab 1).
- The mode itself writes `deployment-change-request.md` to the workspace. Archive that file as a build artifact in the stage's `post.always` block. Use `allowEmptyArchive: true` so a dead MCP server doesn't break the artifact step.
- Wrap the whole Bob invocation in `catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE')` so a Jira outage marks the build UNSTABLE rather than killing it. The DCR file should still be archived even in the UNSTABLE case.

Watch Bob work. Before pushing, read the diff and sanity-check:

- The stage sits **after** `Unit Tests` and **before** the closing `post` block
- `askBob` is called with the exact mode slug `pipeline-dcr-jira-reporter`
- The three input files use **relative** paths, not `/workspace/...` — same trap as Lab 1
- `dcr-context.txt` contains all three keys (`BUILD_NUMBER`, `BRANCH`, `JIRA_PROJECT`) and `JIRA_PROJECT` is non-empty — an empty value will land you a "create issue with no project" error from the MCP server
- `archiveArtifacts` references `deployment-change-request.md`, not whatever the mode's intermediate output happens to be called
- `catchError` is in place — you don't want a MCP/Jira hiccup turning the build red after the actual code already passed every gate

---

## Part 4 — Push and watch

```bash
git add Jenkinsfile .bob/
git commit -m "Lab 5 — DCR stage with Jira MCP reporting"
git push
```

In Jenkins, click **Build Now** on your pipeline and watch the console.

Expected:

- `Checkout`, `PR Review`, and `Unit Tests` run as in Labs 1 & 2
- `DCR` stage runs last. The console shows your stage's banner with the generated DCR markdown printed between the banner lines, followed by the new Jira ticket key and URL
- Build page lists `deployment-change-request.md` under **Build Artifacts**
- A brand-new ticket appears in your assigned Jira project (the one named by `JIRA_PROJECT`). Open the project's board — you'll see your ticket alongside everyone else's on your instance
- The board is shared with up to 4 other students on the same Jira instance. To find just your tickets, click the board's label filter and pick your branch name (e.g., `user1-labs`) — every DCR ticket gets that label
- Pipeline ends SUCCESS (or UNSTABLE if Jira was unreachable — but the artifact is still there)

Push a second commit on the same branch and re-build. You'll get a **second** ticket — `DCR: user1-labs build #2` next to `DCR: user1-labs build #1`. That's the lab's first-pass behavior: one ticket per build. If that bothers you (it should — release managers don't want a new ticket every commit), [Part 5](#part-5--make-it-idempotent-optional) is for you.

---

## Part 5 — Make it idempotent (optional)

Your pipeline currently creates a **new** Jira ticket on every push. That's fine for a demo, but a release manager looking at the board sees five "DCR: user1-labs build #N" tickets and has to figure out which one matters. The production-grade version is: one ticket per branch, with subsequent builds **commenting on** the original.

You already have everything you need to make this work — the per-branch label (`user1-labs`) the mode applies on create is a stable handle for finding the prior ticket. The work is in two places:

1. **Expand `alwaysAllow` in `.bob/mcp.json`** to include `jira_search` (find prior tickets by label) and `jira_add_comment` (post the new DCR onto the existing ticket).
2. **Refine the mode's rules** so its Jira flow becomes:
   - First call `jira_search` with a JQL query like `project = ${JIRA_PROJECT} AND labels = "<BRANCH>" AND labels = "bob-dcr" ORDER BY created DESC`
   - If the search returns one or more tickets, use `jira_add_comment` on the most recent one with the new DCR (or a digest of it — long comments get unwieldy on a real ticket)
   - If the search returns nothing, fall back to the create flow you already have
   - Log clearly which path was taken so the Jenkins console tells you "commented on BOBA-3" vs "created BOBA-7"

Push twice and confirm: the first push creates a ticket, the second push lands a comment on the same ticket. Open the ticket and read the comment thread — does it tell a clear story across builds, or does each comment repeat too much?

If the search ever returns the **wrong** ticket (e.g., a coworker's tickets show up because branch labels collide), that's a signal to tighten the JQL — narrow by reporter, by additional label, or by date. The whole point of the rules file is to encode that contract once and have every build respect it.

---

## Stuck?

- **`uvx: command not found` in the bob container's startup logs.** The image doesn't have `uv` installed. The fix is on the instructor — `setup/bob-cli/Dockerfile` needs `pip install uv` (or `curl -LsSf https://astral.sh/uv/install.sh | sh`) and a rebuild + push. Without this, the MCP server can't launch.
- **MCP server connects but every Jira call returns 401.** The `JIRA_*` env vars aren't reaching the bob container. Confirm the secret was created in the `jenkins` namespace and that the container's `env` block in the Jenkinsfile pod spec references it via `secretKeyRef`. Rotate the API token if the credential is correct but expired.
- **`jira_create_issue` returns 400 / "project is required"  / "No project could be found".** `JIRA_PROJECT` is empty or wrong in `dcr-context.txt`. Confirm (a) the env var is injected into the bob container alongside the other `JIRA_*` vars, and (b) the value matches an existing project key on your instance — capitalization matters (`BOBA` ≠ `boba`).
- **`jira_create_issue` returns 403 / "you do not have permission".** The API token's account doesn't have *Create Issues* on the target project. On Jira Cloud free, the site admin (your instructor) can grant this in **Project settings → Access**. Don't add `jira_*` write tools to `alwaysAllow` as a workaround — fix the permission.
- **Ticket is created but the description is empty / shows raw markdown asterisks.** `mcp-atlassian` converts markdown to Atlassian Document Format on send, but headers and code blocks sometimes render weirdly. Read the actual ticket on Jira's web UI before assuming the data is wrong — it's often just a render difference between the Jenkins console and Jira's editor.
- **Bob says `Tool jira_transition_issue not in alwaysAllow list`.** Working as intended. Mutating tools that aren't in the list trigger an interactive approval prompt, which never gets answered in CI. Either add the tool to `alwaysAllow` (only if you actually want CI to perform that action), or rewrite the mode's rules so it doesn't try to transition.
- **I can't find my ticket on the shared board.** Use the board's label filter and pick your branch name. If you don't see your branch under the label dropdown at all, the create call probably never happened — check the console for an error from `jira_create_issue`. If your branch contains a slash or other unusual character, the mode should have sanitized it to hyphens; look for the sanitized form in the labels.
- **Build goes UNSTABLE but everything else worked.** Open the archived `deployment-change-request.md` and the console output for the `DCR` stage. The most common cause is the MCP server timing out on a slow Jira instance — the DCR file is still good, the build is just flagging that the Jira side didn't confirm.
- **Want to validate `.bob/mcp.json` locally before pushing.** Most JSON validators work, but if you also want to check that Bob can parse it: in your IDE, run `bob --list-mcp-servers` (or whatever the equivalent command is in the version you're on) — the same parser runs in both places.
- **`Jenkinsfile` not working?** Copy `Jenkinsfile.lab5solution` from the repo root over your own `Jenkinsfile` and push. That's the reference state after Lab 5 with all 5 stages integrated.

---

That's Lab 5 — and the workshop. You now have a Jenkins pipeline that reviews diffs, runs and diagnoses tests, and files a structured release report into Jira, all driven by Bob and all configured from a single branch in this repo.
