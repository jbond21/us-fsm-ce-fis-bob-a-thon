# Adopt Instructor Setup — Plan

> **Status:** The `setup/` toolchain is validated end-to-end. Dry run on `jenkins-andy-test` proved Helm deploy, per-user Jenkins folders with credential isolation, per-user OpenShift namespaces, custom `bob-cli` image, shared workspace across the pipeline pod, and custom-mode loading from a checked-out branch all work. See `DRY_RUN_PLAN.md` for the exact path taken and `CHANGES_NEEDED.md` for every local deviation from the coworker's docs. **This plan is the work remaining** to bake those deviations into `setup/` and clean up the repo.

**Branch:** `adopt-instructor-setup`.

**Rule:** one commit per file. After each commit, stop and wait for explicit "committed" before moving to the next file. Don't batch, don't amend, don't force-push.

---

## 1. Decisions needed before starting

These block Steps 2 and 3. Decide before editing anything.

### 1.1 Custom `jenkins-agent` image: keep or drop?

Dry run used a 3-container public-image pattern (`maven:3.9-eclipse-temurin-17` + `origin-cli:latest` + our `bob-cli`) with explicit shared volumes. Worked cleanly. Our `k8s/openshift/jenkins-agent/Dockerfile` wasn't used.

- **A — drop.** Delete `k8s/openshift/jenkins-agent/`. Lab Jenkinsfiles migrate to the 3-container pattern. One less image to maintain.
- **B — keep.** Retain the 2-container pattern. Our existing `Jenkinsfile.lab*solution` stays valid, but they're getting rebuilt anyway (§3.2).

**Recommendation:** A — drop.

### 1.2 `setup/assets/template-jenkins-pipeline`: delete or fix?

File is stale. References an old "SRE Deploy Lab" era `workshop-app` deploy that doesn't match the 5-lab workshop.

- **Delete.** `Jenkinsfile.lab*solution` is the canonical reference participants follow.
- **Fix.** Apply CHANGES_NEEDED #1 (Bob naming) + #8 (shared volumes) to make it a minimal working example.

**Recommendation:** delete.

### 1.3 Kubernetes cloud config: declarative or manual?

CHANGES_NEEDED #5 — where does the cloud config live after Phase 1?

- **Declarative.** In `template-jenkins-values_v2.yaml` — flip `JCasC.defaultConfig: true`, or add an explicit `configScripts.kubernetes-cloud: |` block. No post-install Groovy.
- **Manual.** A new section in `INSTRUCTOR_SETUP_TZ.md` with a Script Console Groovy step (matching the existing post-install pattern).

**Recommendation:** declarative in the values file.

---

## 2. Step 1 — apply `CHANGES_NEEDED.md` to `setup/`

One commit per file. After each, stop and wait for "committed."

### 2.1 `setup/assets/template-jenkins-values_v2.yaml`

Item #5 per decision §1.3. Single-file commit.

### 2.2 `setup/INSTRUCTOR_SETUP_TZ.md`

Items #1, #2, #3, #4, #6, #7, #9, and the doc side of #5. This is the biggest diff. If it's too large for one commit, split by section:

- **2.2a** §1.2 + §1.3 + §1.3.1 naming (#1)
- **2.2b** §3.1.7 Groovy — add `CredentialsProvider.VIEW`, remove `Item.DELETE` (#6, #9)
- **2.2c** new §3.3 cloud config documentation (#5 doc side, if decision §1.3 ≠ fully declarative)
- **2.2d** new §3.4 "Add a GitHub PAT" section (#7)
- **2.2e** §5.1 — Dockerfile build step, registry route, podman username fix (#2, #3, #4)
- **2.2f** §5.2 secret naming (#1)
- **2.2g** troubleshooting table + rotate-key snippet naming (#1)

### 2.3 `setup/assets/template-jenkins-pipeline`

Per decision §1.2 — either `git rm` or apply #1 + #8.

### 2.4 Verify

Re-execute `DRY_RUN_PLAN.md` against a fresh namespace (e.g., `jenkins-andy-test-2`). Every "deliberate deviation" at the top of `DRY_RUN_PLAN.md` should now be unnecessary. If any are still needed, Step 1 isn't done.

---

## 3. Step 2 — cleanup

Only after Step 1 is verified. Some Step 1 edits reference files on this delete list.

### 3.1 Delete

| File / dir | Reason |
|---|---|
| `k8s/openshift/jenkins-workshop/` (entire dir) | Old `jenkins-persistent`-template deploy kit; superseded by the Helm chart in `setup/` |
| `WORKSHOP_SETUP.md` | Instructor doc for the old kit; superseded by `setup/INSTRUCTOR_SETUP_TZ.md`. Update the "Starting Points" section in `README.md` in the same commit |
| `setup/INSTRUCTOR_SETUP_NotTZ.md` | Non-TechZone variant; not our target |
| `setup/assets/template-jenkins-values_v1.yaml` | Superseded by `_v2.yaml` |
| `setup/assets/template-jenkins-values_rhcop.yaml` | Different chart schema; not our platform |
| `setup/scripts/generate-jenkins-users.py` (v1) | JCasC-YAML variant for NotTZ; superseded by `_v2.py` |
| `setup/scripts/generate-htpasswd.sh` + `generate-htpasswd.py` | NotTZ-only htpasswd tooling |
| `setup/scripts/requirements.txt` | Only needed by the htpasswd files above |
| `setup/assets/job-template.xml` | Unused — no automation consumes it |
| `k8s/openshift/jenkins-agent/Dockerfile` | If §1.1 = A (drop) |
| `setup/assets/template-jenkins-pipeline` | If §1.2 = delete (and not already removed in §2.3) |

### 3.2 Keep

| File / dir | Reason |
|---|---|
| `setup/INSTRUCTOR_SETUP_TZ.md` | Canonical setup doc |
| `setup/assets/template-jenkins-values_v2.yaml` | Helm values file |
| `setup/assets/jenkins-scc.yaml` | SCC ClusterRoleBinding template |
| `setup/assets/workshop-user-project-quota.yaml` | Per-user quota |
| `setup/scripts/generate-security-setup.py` | Post-install security bootstrap (load-bearing) |
| `setup/scripts/generate-jenkins-users_v2.py` | User creation via Groovy |
| `setup/scripts/create-projects.sh` | Per-user OpenShift namespace provisioning |
| `k8s/openshift/bob-cli-sidecar/Dockerfile` | Our Bob image — source of truth |
| `Jenkinsfile.test` | Smoke test; re-run after each Step 1 commit to catch regressions |
| `Jenkinsfile`, `Jenkinsfile.lab*solution`, `Jenkinsfile.finalsolution`, `labs/`, `order-service/`, `.bob/`, `README.md` | Workshop content; orthogonal to deploy mechanism |

### 3.3 Delete the planning docs at the end

| File | When |
|---|---|
| `CHANGES_NEEDED.md` | After Step 1 |
| `DRY_RUN_PLAN.md` | After Step 2 |
| `ADOPT_INSTRUCTOR_SETUP_PLAN.md` (this file) | After Step 3 |

---

## 4. Step 3 — lab docs + solution Jenkinsfiles

Required before a real workshop run. Can happen in parallel with or after Step 2.

### 4.1 Rewrite `labs/00_SETUP.md`

Currently documents the **old kit's** credential pattern (`user1` / `bobathon-1`). Rewrite for the new deploy:

- Credentials pattern: `userN` / `userNWorkshop2026!`
- Navigate into `userN` folder (not Jenkins root) for every action
- Add GitHub PAT to the folder credential store — mirror `DRY_RUN_PLAN.md` step 17 navigation (homepage → `userN` folder → Credentials sidebar → `(global)` under Stores scoped to userN)
- Create the participant pipeline **inside the folder**

### 4.2 Rebuild `Jenkinsfile.lab*solution` as cumulative

Currently 4 of 5 files are stubs (identical to base `Jenkinsfile` except namespace). Rebuild:

- `Jenkinsfile.lab1solution` = base + Lab 1 (PR review)
- `Jenkinsfile.lab2solution` = base + Lab 1 + Lab 2 (currently Lab 2 only, missing Lab 1)
- `Jenkinsfile.lab3solution` = base + Lab 1 + Lab 2 + Lab 3 (security scan)
- `Jenkinsfile.lab4solution` = base + Lab 1–4 (linting + PR comment)
- `Jenkinsfile.finalsolution` = base + Lab 1–5 (DCR + Jira)

Pod spec shape (2-container vs 3-container) follows §1.1.

### 4.3 Write the missing lab docs

`README.md` references lab files that don't exist yet:

- `labs/LAB1_PR_REVIEW.md`
- `labs/LAB3_SECURITY_SCANNING.md`
- `labs/LAB4_LINTING.md`
- `labs/LAB5_DCR_REPORTING.md`

Authored by lab owners; this plan tracks that they're outstanding.

---

## 5. For the next session

- **§1 decisions are blocking.** Don't start Step 1 without them.
- **Read order:** this file → `CHANGES_NEEDED.md` → `DRY_RUN_PLAN.md` if you need the validation evidence.
- **Trust the cluster over memory.** If a Phase 1 edit references something that doesn't match live state, check `git log` and the cluster before acting.
- **Commit pacing.** One file per commit. Wait for "committed" between files.
