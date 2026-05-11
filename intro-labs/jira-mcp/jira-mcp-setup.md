# Lab: Jira MCP Server Setup
**Duration:** 15 minutes
**Objective:** Connect Bob to Jira through the Atlassian MCP server so Bob can read and act on tickets from your IDE

**Prerequisites:**
- Completed Lab 1: Bob Fundamentals and Lab 2: Bob Advanced Features
- Bob application installed and running
- `uv` / `uvx` installed on your machine ([install instructions](https://docs.astral.sh/uv/getting-started/installation/))
- **Jira credentials handed out by your instructor:**
  - Jira URL (e.g. `https://your-org.atlassian.net`)
  - Jira username (your email)
  - Jira API token

> 📌 **Reference:** [Bob MCP Documentation](https://bob.ibm.com/docs/ide/configuration/mcp/understanding-mcp) | [Atlassian MCP Server](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/getting-started-with-the-atlassian-remote-mcp-server/)

---

## Table of Contents
1. [Overview](#overview)
2. [Step 1 — Open the Project MCP Config](#step-1--open-the-project-mcp-config)
3. [Step 2 — Add the Atlassian Server Block](#step-2--add-the-atlassian-server-block)
4. [Step 3 — Fill in Your `.env`](#step-3--fill-in-your-env)
5. [Step 4 — Restart Bob](#step-4--restart-bob)
6. [Step 5 — Verify the Connection](#step-5--verify-the-connection)
7. [Troubleshooting](#troubleshooting)

---

## Overview

MCP (Model Context Protocol) lets Bob talk to external tools and services — in this case, your Jira instance. By registering an Atlassian MCP server in Bob's config, Bob gains tools like `jira_search`, `jira_get_issue`, and `jira_add_comment` that you can invoke through natural language in Advanced mode.

You'll:
1. Add a server entry to the project's `.bob/mcp.json`
2. Put your Jira credentials in `.env` at the repo root
3. Restart Bob so it picks up the env vars
4. Use the connection from Advanced mode to list tools, search issues, and read a ticket

Credentials are referenced from `mcp.json` as `${JIRA_URL}`, `${JIRA_USERNAME}`, `${JIRA_API_TOKEN}` — Bob expands them at startup from the environment. That way the same `.bob/mcp.json` works in every Bob instance: locally it reads from your `.env`, and on the cluster it reads from injected secrets.

---

## Step 1 — Open the Project MCP Config

This workshop uses **project-level** MCP config so the server registration is part of the repo. The file is already in place at the repo root:

```
.bob/mcp.json
```

It currently contains an empty `mcpServers` object:

```json
{
    "mcpServers": {
    }
}
```

Open it in your editor.

> ℹ️ **Why project-level?** Bob loads `.bob/mcp.json` from whatever workspace it has open. Committing it to the repo means every Bob instance — your IDE locally and the bob-cli container in the Jenkins pipeline — picks up the same server registrations from `git checkout`. No one has to hand-edit a global config.

---

## Step 2 — Add the Atlassian Server Block

Replace the empty `mcpServers` object with:

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
    }
  }
}
```

**What each field does:**
- `command` / `args`: Bob launches the MCP server with `uvx mcp-atlassian`. `uvx` runs the Python package without a separate install step.
- `env`: Each value uses `${VAR}` syntax so Bob substitutes from the surrounding environment at startup. Actual credentials never live in this file.
- `disabled: false`: Server is active. Set `true` to temporarily turn it off.
- `alwaysAllow`: Tools Bob can call without asking for approval each time. Starting with three read/comment-leaning tools — keep destructive operations (transition, delete) off this list.

> 📝 **App team vs SRE team:** the `alwaysAllow` list matters most for the SRE team, where Bob runs non-interactively in a Jenkins pod and there's no human around to click "approve". App team participants can leave it in or strip it down to `[]` — you'll be in the chat interface anyway, and you can auto-approve tools on the fly from there as you use them.

Save the file.

---

## Step 3 — Fill in Your `.env`

A `.env.example` template ships in `intro-labs/jira-mcp/`. Copy it to a `.env` at the repo root:

```bash
cp intro-labs/jira-mcp/.env.example .env
```

Open `.env` and replace the placeholder values with the credentials your instructor handed you:

```bash
JIRA_URL=https://fis-bob-workshop.atlassian.net
JIRA_USERNAME=user12@fis-workshop.example
JIRA_API_TOKEN=ATATT3xFfGF0...your-token-here
```

`.env` is gitignored at the repo root, so your token will not be committed.

> ⚠️ API tokens are secrets. Don't paste yours into a chat, screenshot, or commit. If exposed, rotate it at id.atlassian.com.

---

## Step 4 — Restart Bob

Bob reads `.bob/mcp.json` and `.env` once at startup. Quit Bob completely and reopen the workspace so the Atlassian server gets launched with your credentials.

**To verify the server started:**
1. Open Settings → MCP
2. Look for `atlassian` in the server list
3. Status should be **Connected** (green)

If you see **Failed** or a red status, jump to [Troubleshooting](#troubleshooting) before continuing.

---

## Step 5 — Verify the Connection

MCP tools are only available in **Advanced mode**, so switch the mode selector (bottom left) to **Advanced** before trying these prompts.

**Prompt 1 — list available tools:**
```text
List the MCP tools you have access to from the atlassian server.
```

You should see tool names like `jira_get_issue`, `jira_search`, `jira_add_comment`, plus several others Bob can call when you approve them.

**Prompt 2 — confirm the credentials work:**
```text
Use jira_search to find the 5 most recent issues assigned to me.
```

Bob will call the MCP tool and return a list of issue keys + summaries. If you get an authentication error here but Step 4 showed Connected, double-check the values in `.env`.

**Prompt 3 — read a single issue:**
```text
Show me the full description and the latest 3 comments on issue <PROJ-123>.
```

Replace `<PROJ-123>` with any issue key from Prompt 2's results.

**What to observe:**
- Bob announces which MCP tool it's about to call before calling it
- Tools in `alwaysAllow` run without an approval prompt
- Tools NOT in `alwaysAllow` (e.g. transitioning a ticket) prompt you for one-time approval

✅ If all three prompts returned data from your Jira instance, the MCP server is wired up correctly.

---

## Troubleshooting

### `uvx: command not found` in Bob's MCP server logs
`uv` isn't installed or not on Bob's PATH. Install it via the [official instructions](https://docs.astral.sh/uv/getting-started/installation/), then fully quit Bob (not just close the window) and relaunch — Bob captures PATH at startup, so an open IDE won't see a freshly-installed `uvx`.

### MCP server shows "Failed" in Settings → MCP
Most common causes:
- Typo in `.bob/mcp.json` — invalid JSON (missing comma, stray brace). Bob's MCP panel usually shows the parse error.
- One of the three env vars is empty — Bob expanded `${JIRA_URL}` to an empty string because it wasn't set in the shell. See the next item.

### Server starts but env values are empty / `${JIRA_URL}` shows up literally
Bob couldn't find the values. Check that:
- `.env` is at the **repo root**, not inside `intro-labs/jira-mcp/` or `.bob/`
- The variable names in `.env` exactly match `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN` (case sensitive, no quotes around values, no spaces around `=`)
- You restarted Bob fully after editing `.env` — Bob doesn't watch `.env` for changes

### `list tools` works but every Jira call returns 401
Credentials are wrong. Verify in `.env`:
- `JIRA_USERNAME` is your **email**, not a display name
- `JIRA_API_TOKEN` is the API token from id.atlassian.com, not your account password
- `JIRA_URL` matches the exact org URL (no trailing slash, no path)

After fixing `.env`, restart Bob — Bob doesn't watch `.env` for changes.

### MCP tools don't appear in the chat
Confirm you switched to **Advanced mode**. Plan / Code / Ask modes can't call MCP tools — this is by design.

### I'm seeing approval prompts on every call, even for tools in `alwaysAllow`
Check that the server name in `.bob/mcp.json` exactly matches `atlassian` (lowercase, no typos). The `alwaysAllow` list is matched against `<server-name>__<tool-name>` internally.

---
