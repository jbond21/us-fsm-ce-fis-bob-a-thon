# Jira Account Setup — Bob-a-thon Workshop

Setup steps for the three Jira instances Lab 5 needs. One instance per instructor; five students mapped to each.

## Table of Contents

1. [Instance assignments](#1-instance-assignments)
2. [Per-instructor Jira setup](#2-per-instructor-jira-setup)
   - [2.1 Create the site](#21-create-the-site)
   - [2.2 Create the project](#22-create-the-project)
   - [2.3 Disable notifications](#23-disable-notifications)
   - [2.4 Open project visibility](#24-open-project-visibility)
   - [2.5 Generate the API token](#25-generate-the-api-token)
   - [2.6 Verify with curl](#26-verify-with-curl)
3. [Jenkins admin steps](#3-jenkins-admin-steps)
   - [3.1 Required values](#31-required-values)
   - [3.2 Create the Kubernetes secrets](#32-create-the-kubernetes-secrets)
   - [3.3 Edit the Jenkinsfile pod template](#33-edit-the-jenkinsfile-pod-template)
   - [3.4 Push to main](#34-push-to-main)
4. [Student → instance mapping](#4-student--instance-mapping)
5. [Verification](#5-verification)
6. [Common Issues and Fixes](#common-issues-and-fixes)

---

## 1. Instance assignments

| Instructor | Site URL | Students |
|---|---|---|
| Andy | `bobathon1.atlassian.net` | user01–user05 |
| (Coworker 2) | `bobathon2.atlassian.net` (TBD) | user06–user10 |
| (Coworker 3) | `bobathon3.atlassian.net` (TBD) | user11–user15 |

All three instances use project key `KAN` — Atlassian's default for any Space/project created from the Kanban template. Keys are scoped per-site, so `KAN` on one site is independent of `KAN` on another. No collision.

---

## 2. Per-instructor Jira setup

Each instructor performs Section 2 once on their assigned instance. ~15 min.

### 2.1 Create the site

1. <https://www.atlassian.com/try/cloud/signup?bundle=jira-software>
2. Sign up with a workshop-dedicated email (a throwaway Gmail is fine).
3. Pick the site URL from Section 1 (e.g., `bobathon1.atlassian.net`). The subdomain becomes part of `JIRA_URL`.
4. Choose **Free**.
5. Skip the invite-teammates wizard.

The signup email is your `JIRA_USERNAME`.

### 2.2 Create the project

In Atlassian's newer **Spaces** UI the entry point is **Create** (top-right) → **Space** → **Kanban** template. In classic Jira it's **Projects → Create project**.

1. Choose the **Kanban** template (under "Software development" in classic Jira; under the Kanban tile in Spaces).
2. Name the project/space `FIS Bobathon` (or similar).
3. The project key is auto-assigned as `KAN` — you don't enter it. Confirm by opening the board and checking that sample task cards show `KAN-1`, `KAN-2`.
4. Delete any sample tasks the template seeded.

### 2.3 Disable notifications

Cuts admin inbox noise and avoids hitting the 200/day cap.

1. **Project settings → Notifications**
2. Turn off: Issue created, Issue commented, Issue updated, Issue transitioned.

If the UI doesn't expose toggles for those exact events, add an inbox filter dropping `*@atlassian.net` for the duration of the workshop.

### 2.4 Open project visibility

So students can open ticket URLs without an Atlassian account.

1. **Project settings → Access**
2. Enable public/anonymous read access for the project.
3. Verify by opening any ticket URL in an incognito window.

If your account doesn't expose anonymous read, add students as users on the site (burns 5 of your 10 user slots per instance, but works).

### 2.5 Generate the API token

1. <https://id.atlassian.com/manage-profile/security/api-tokens>
2. **Create API token** → label it `bobathon-jenkins`
3. Copy the token immediately (only shown once). Save in a password manager.

### 2.6 Verify with curl

```bash
curl -s -u "$JIRA_USERNAME:$JIRA_API_TOKEN" \
  "$JIRA_URL/rest/api/3/project/$JIRA_PROJECT" | head -50
```

Expected: JSON describing your project. `401` = bad username/token; `404` = bad URL or project key.

---

## 3. Jenkins admin steps

Once all three instructors have completed Section 2, the Jenkins admin wires everything up.

### 3.1 Required values

Each instructor sends these four values via a secure channel (1Password share, Signal, encrypted email — **not** Slack or Teams).

| Variable | Example |
|---|---|
| `JIRA_URL` | `https://bobathon1.atlassian.net` (no trailing slash) |
| `JIRA_USERNAME` | `bobathon1@gmail.com` (the signup email) |
| `JIRA_API_TOKEN` | `ATATT3xFf...` |
| `JIRA_PROJECT` | `KAN` |

### 3.2 Create the Kubernetes secrets

Run once per instance, naming the secrets `jira-creds-a` / `-b` / `-c`:

```bash
oc create secret generic jira-creds-a \
  --from-literal=JIRA_URL=<JIRA_URL> \
  --from-literal=JIRA_USERNAME=<JIRA_USERNAME> \
  --from-literal=JIRA_API_TOKEN=<JIRA_API_TOKEN> \
  --from-literal=JIRA_PROJECT=KAN \
  -n jenkins
```

Grant the Jenkins ServiceAccount read access to all three secrets:

```bash
oc create role jira-secret-reader \
  --verb=get \
  --resource=secrets \
  --resource-name=jira-creds-a \
  --resource-name=jira-creds-b \
  --resource-name=jira-creds-c \
  -n jenkins

oc create rolebinding jira-secret-reader \
  --role=jira-secret-reader \
  --serviceaccount=jenkins:jenkins \
  -n jenkins
```

### 3.3 Edit the Jenkinsfile pod template

The pod template is inline in the repo's root `Jenkinsfile` (the `yaml """..."""` block in the `agent { kubernetes { } }` stanza). No JCasC, no Jenkins-side template. Two changes:

**Change 1 — routing variable.** Add at the top of the file, above `pipeline { }`:

```groovy
def jobName = env.JOB_NAME ?: ''
def jiraSecret = (jobName ==~ /.*user0[1-5].*/) ? 'jira-creds-a' :
                 (jobName ==~ /.*user(0[6-9]|10).*/) ? 'jira-creds-b' :
                                                       'jira-creds-c'
```

Assumes `userNN-pipeline` job naming from `labs/sre/00_SETUP.md`. Anything that doesn't match the first two patterns falls through to `jira-creds-c`.

**Change 2 — env entries.** In the bob container's `env:` block (after `BOBSHELL_API_KEY`, `BOB_ACCEPT_LICENSE`, `HOME`), add:

```yaml
    - name: JIRA_URL
      valueFrom:
        secretKeyRef:
          name: ${jiraSecret}
          key: JIRA_URL
    - name: JIRA_USERNAME
      valueFrom:
        secretKeyRef:
          name: ${jiraSecret}
          key: JIRA_USERNAME
    - name: JIRA_API_TOKEN
      valueFrom:
        secretKeyRef:
          name: ${jiraSecret}
          key: JIRA_API_TOKEN
    - name: JIRA_PROJECT
      valueFrom:
        secretKeyRef:
          name: ${jiraSecret}
          key: JIRA_PROJECT
```

`${jiraSecret}` interpolates via the existing Groovy GString (`"""..."""`) — no syntax change to the YAML block.

### 3.4 Push to main

Commit the updated `Jenkinsfile` to `main`. Students who fork their working branch from `main` after this commit pick up the change automatically. Existing branches need a `git merge main` (or rebase) before Lab 5.

Agent pods are dynamic — no Jenkins or OpenShift restart needed. The next build on each pipeline spawns a pod with the new env vars in place.

> **Verified Bob behavior:** `mcp-atlassian` reads `JIRA_*` from its process environment. Bob expands `${VAR}` placeholders in `.bob/mcp.json`'s `env:` block against its own process env before launching the MCP subprocess. Confirmed 2026-05-06 by an in-cluster test that expanded `${BOB_ACCEPT_LICENSE}` correctly. The lab's existing `mcp.json` config (using `${JIRA_URL}` etc.) works without modification once the env vars are present on the bob container.

---

## 4. Student → instance mapping

| User group | Instance | Site URL to share with students |
|---|---|---|
| user01–user05 | Andy | `https://bobathon1.atlassian.net/browse/KAN` |
| user06–user10 | Coworker 2 | `https://bobathon2.atlassian.net/browse/KAN` (TBD) |
| user11–user15 | Coworker 3 | `https://bobathon3.atlassian.net/browse/KAN` (TBD) |

Students filter the project board by their branch label (`user1-labs`, etc.) to find their own DCR tickets.

---

## 5. Verification

Before workshop day, run one full pipeline against each instance:

1. Pick a test username from each group (user01, user06, user11) and create branches `userNN-labs` on the workshop repo.
2. Configure the pipeline per `labs/sre/00_SETUP.md`.
3. Walk the Jenkinsfile through Labs 1, 2, and 5.
4. **Build Now.**

For each build, confirm:
- The `DCR` stage prints a Jira ticket key matching the expected project (e.g., `KAN-1`).
- The ticket is reachable at `<JIRA_URL>/browse/<KEY>` in an incognito window.
- The ticket has labels `bob-dcr` and `<branch>`.
- `deployment-change-request.md` is in the build's archived artifacts.

---

## Common Issues and Fixes

- **`401 Unauthorized` from the curl check.** `JIRA_USERNAME` must be the email address, not a display name. Confirm at <https://id.atlassian.com/manage-profile/profile-and-visibility>.
- **`404 Not Found` from the curl check.** Bad `JIRA_URL` (trailing slash, typo) or wrong project key.
- **`jira_create_issue` returns 403.** API token's account lacks Create Issues on the project. Check **Project settings → Access**.
- **`jira_create_issue` returns 400 / "No project could be found".** `JIRA_PROJECT` is empty in the K8s secret. Re-check the `oc create secret` command.
- **Build fails with `${jiraSecret}` literal in pod YAML.** The Groovy variable wasn't defined or the YAML isn't a GString. Confirm the pod template is wrapped in `"""..."""` (triple double-quote) and the `def jiraSecret = ...` line is above `pipeline { }`.
- **Multiple students share a board, can't find their tickets.** Use the board's **Label** filter and pick the branch name. Every DCR ticket has the branch as a label.
- **Branch name has slashes/spaces — Jira label rejection.** The lab's mode sanitizes branch names to label-safe form. If it isn't, re-prompt Mode Writer to add the sanitization rule.
- **Hit 200-emails/day cap.** Re-do Section 2.3 or set the project's notification scheme to "no notifications" until the cap resets.
