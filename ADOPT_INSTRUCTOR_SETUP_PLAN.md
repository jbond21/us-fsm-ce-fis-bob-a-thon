# Adopt Instructor Setup — Plan

**Audience:** A Claude Code session (or engineer) picking up this work cold. This document is self-contained — read it top to bottom and you'll have everything you need to execute.

**Branch:** `adopt-instructor-setup` (off `main`). No commits on this branch yet — Phase 1 was read-only audit.

**Goal:** Stand up a fresh OpenShift + Jenkins environment end-to-end using the `setup/` tooling that was contributed on the `instructor-setup` branch (Helm + per-user projects + per-user Jenkins folders), then verify a participant can add their own GitHub PAT, push Bob custom modes to their branch, and have the Jenkins pipeline invoke them. Only after that works do we delete anything.

---

## 1. How we got here

Two parallel branches were developed independently and merged into `main` back-to-back with **zero merge conflicts** (because they touched disjoint paths):

| Branch | Scope | Key additions |
|---|---|---|
| `New_Config_And_Cleanup` (ours) | Cleaned up the old "SRE Deploy Lab" scope, reframed the repo around a 5-lab Bob-a-thon workshop. Built Lab 2 (unit testing + Bob failure analysis), shipped three solution Bob modes with detailed rule files, wrote participant setup guide. | `labs/LAB2_UNIT_TESTING.md`, `labs/00_SETUP.md`, `Jenkinsfile.lab*solution`, `Jenkinsfile.test`, `.bob/rules-solution-*/`, `WORKSHOP_SETUP.md`, `k8s/openshift/jenkins-workshop/` (Groovy-init Jenkins deploy kit) |
| `instructor-setup` (coworker) | Built extensive instructor tooling for per-user isolation — each participant gets their own OpenShift namespace, their own Jenkins folder with matrix auth, and their own credential store. Used Jenkins Helm chart + Groovy via Script Console. | Entire `setup/` directory: `INSTRUCTOR_SETUP_TZ.md`, `INSTRUCTOR_SETUP_NotTZ.md`, `setup/scripts/*`, `setup/assets/*` |

Both merged into `main` → we now have **two different Jenkins deployment kits** coexisting:

- `k8s/openshift/jenkins-workshop/` — ours. OpenShift `jenkins-persistent` template + Groovy init script. Shared workshop-admin + user1–N Jenkins accounts. No per-user credential isolation.
- `setup/` — theirs. Jenkins Helm chart + Script-Console Groovy scripts. Per-user Jenkins folders with matrix auth granting each user credential permissions *within their folder only*. Per-user OpenShift namespaces (`userN-dev`) for a future lab where users deploy workloads.

---

## 2. Why we're adopting theirs

Two workshop requirements it solves that ours doesn't:

1. **Per-user GitHub PATs.** Previously required all users to share one admin-created credential (matrix-auth friction in our Groovy init). His per-folder credential scoping lets each user add their own PAT to their own folder, and their pipeline picks it up automatically.
2. **Per-user OpenShift projects.** A future lab has participants running `oc` commands — each needs their own sandboxed project. `setup/scripts/create-projects.sh` provisions `user1-dev` through `user20-dev` with appropriate RBAC + quotas.

We're not adopting it because it's strictly better — ours is simpler. We're adopting it because it unlocks those two features.

---

## 3. Strategy

- **Reconcile the bare minimum.** His image/secret/env-var names differ from ours. Rather than renaming his image to `bob-cli-sidecar` everywhere, we keep his name (`bob-cli`) and build our proven Dockerfile tagged as `bob-cli`. Only the env var + secret references need editing (our Bob CLI expects `BOBSHELL_API_KEY`).
- **Deploy first, delete second.** Nothing gets deleted from `main` until a fresh deploy using his tooling successfully runs a Lab 2 pipeline end-to-end with real Bob invocations.
- **One commit per file.** For easy review / revert.
- **Commit pacing:** The user has requested "wait for explicit 'committed' between plan stages." Do one phase's edits, stop, show the diff, wait for them to stage/commit + say "committed" before continuing.

---

## 4. Phase 1 audit findings (done — read-only, no file changes)

### 4.1 Architecture discoveries

- **His deploy is NOT pure JCasC** despite `JCasC: enabled: true` in `setup/assets/template-jenkins-values_v2.yaml`. Line 34 of that file has `configScripts: {}` (empty). The actual Jenkins user setup happens via **Groovy scripts pasted into the Script Console** post-install. Flow in `INSTRUCTOR_SETUP_TZ.md`:
  1. Helm install with the values file → Jenkins starts unsecured
  2. `generate-security-setup.py` → Groovy script that enables security + creates admin (§3.1.6)
  3. `generate-jenkins-users_v2.py` → Groovy script that creates `user1`–`user20` local accounts (§3.1.7 step 1)
  4. Hand-written Groovy snippet (§3.1.7 step 4) → creates **per-user folders** with matrix-auth granting each user `CREATE`/`UPDATE`/`DELETE`/`MANAGE_DOMAINS` on credentials **scoped to their own folder only**
  
  ⚠️ This means `generate-security-setup.py` is **load-bearing**, not redundant. Do not propose deleting it.

- **Per-user credential isolation is via Jenkins folders**, not per-user stores. Simpler than what I first thought. Each `userN` gets a folder named `user1`, `user2`, etc. and can only see credentials inside it.

- **Agent pods are 3 containers, all public images** (§1.3 of `INSTRUCTOR_SETUP_TZ.md`):
  - `build-tools`: `maven:3.9-eclipse-temurin-17` (public)
  - `oc-tools`: `quay.io/openshift/origin-cli:latest` (public)
  - `bob`: `<internal-registry>/jenkins/bob-cli:latest` (ours, tagged as `bob-cli`)
  
  Our `k8s/openshift/jenkins-agent/Dockerfile` is **unused** in his model. Decision point — see §7.

- **Jenkins lives in namespace `jenkins`** — hardcoded across several files (SCC binding subject, secret namespace, image push target, create-projects.sh's `JENKINS_NS` variable). Default is fine; just know it.

### 4.2 Naming mismatches

His setup uses names that don't match our proven-working Bob setup:

| Reference | His name | Ours (proven-working) |
|---|---|---|
| Bob image | `bob-cli` | `bob-cli-sidecar` |
| Bob Dockerfile location | (his was at `k8s/openshift/bob-cli/` on the instructor-setup branch — merged out) | `k8s/openshift/bob-cli-sidecar/Dockerfile` (this is the one that exists in main) |
| Secret name | `bob-api-key` | `bob-cli-credentials` |
| Secret key | `api-key` | `BOBSHELL_API_KEY` |
| Env var (expected by Bob CLI) | `BOB_API_KEY` | `BOBSHELL_API_KEY` |

**Resolution strategy:** keep his image name (`bob-cli`) in all his files. Build from *our* Dockerfile and tag the result `bob-cli:latest`. Only fix the secret + env var names since Bob CLI actually reads `BOBSHELL_API_KEY` (verified by previous working deployments).

### 4.3 Files with reconciliation edits (Phase 2)

Only these files need text edits. Nothing structural.

| File | What changes |
|---|---|
| `setup/assets/template-jenkins-pipeline` line 35 | `BOB_API_KEY` → `BOBSHELL_API_KEY` |
| `setup/assets/template-jenkins-pipeline` line 38 | secret name `bob-api-key` → `bob-cli-credentials` |
| `setup/assets/template-jenkins-pipeline` line 39 | key `api-key` → `BOBSHELL_API_KEY` |
| `setup/INSTRUCTOR_SETUP_TZ.md` §5.1 (lines ~390–398) | Build from `k8s/openshift/bob-cli-sidecar/` (our Dockerfile path). Keep the image tag as `bob-cli:latest` — do not rename. |
| `setup/INSTRUCTOR_SETUP_TZ.md` §5.2 (lines ~410–433) | `oc create secret generic bob-api-key --from-literal=api-key=...` → `oc create secret generic bob-cli-credentials --from-literal=BOBSHELL_API_KEY=...`. Update role `bob-secret-reader` resource-name accordingly. Update the note about `$BOB_API_KEY` → `$BOBSHELL_API_KEY`. |
| `setup/INSTRUCTOR_SETUP_TZ.md` §1.3 table (line 87) | The `bob` container row still references `BOB_API_KEY` and image `bob-cli`. Update env var only; keep image name. |
| `setup/INSTRUCTOR_SETUP_TZ.md` §1.3.1 credential flow diagram (lines 94–95) | `bob-api-key` → `bob-cli-credentials`, `$BOB_API_KEY` → `$BOBSHELL_API_KEY` |
| `setup/INSTRUCTOR_SETUP_TZ.md` §1.2 namespace diagram (lines 65–66) | `bob-cli ImageStream` is fine (image stays `bob-cli`). Secret `bob-api-key` → `bob-cli-credentials`. |
| `setup/INSTRUCTOR_SETUP_TZ.md` troubleshooting table (line 452) | Row about `BOB_API_KEY` → update env var |
| `setup/INSTRUCTOR_SETUP_TZ.md` rotate-key command (lines ~485–490) | `bob-api-key` → `bob-cli-credentials`, `api-key=` → `BOBSHELL_API_KEY=` |
| `setup/INSTRUCTOR_SETUP_NotTZ.md` | Same kinds of edits on similar lines (63, 64, 85, 93, 101, 122, 459–463, 479–480, 490, 499, 544). Slated for deletion in Phase 5 but fix now for consistency in case it's consulted during Phase 3. |

Nothing else in `setup/` references Bob naming. The SCC yaml, quota yaml, user-gen scripts, create-projects.sh (just one comment mentioning "bob-cli image" which is still accurate) are all fine as-is.

---

## 5. Phase 2 — Reconcile edits (NOT STARTED)

Three files to touch, one commit per file:

1. `setup/assets/template-jenkins-pipeline` (3 line changes)
2. `setup/INSTRUCTOR_SETUP_TZ.md` (~12 line changes across the file)
3. `setup/INSTRUCTOR_SETUP_NotTZ.md` (~13 line changes across the file — parallel to TZ)

After Phase 2: the `setup/` directory contains self-consistent instructions and templates that point at our secret/env var conventions and reference the correct Dockerfile path. User can then proceed with a fresh deploy.

---

## 6. Phase 3 — Fresh deploy (user executes)

Create a new OCP project (e.g., `fis-bobathon-fresh`) to avoid state collisions from previous testing. Then follow `setup/INSTRUCTOR_SETUP_TZ.md` top-to-bottom.

Prerequisites (§2.2): `oc` as cluster-admin, `helm` v3, `podman` or `docker`, `uv` or venv, `curl`, `jq`, `bash`.

Steps (summarized, follow the doc for exact commands):

1. **§3.1.1–3.1.3** Create `jenkins` namespace, add Jenkins Helm repo, apply `jenkins-scc.yaml`.
2. **§3.1.4–3.1.5** Copy `template-jenkins-values_v2.yaml` → `jenkins-values.yaml`, helm install.
3. **§3.1.6** Retrieve admin password, create Jenkins route, run `generate-security-setup.py`, paste output into `/script`.
4. **§3.1.7** Run `generate-jenkins-users_v2.py`, paste Groovy output into `/script`. Then paste the per-user folder matrix-auth Groovy (in the doc) to create folders with credential permissions.
5. **§3.2** Grant Jenkins SA `edit` + `image-puller` roles.
6. **§4** Create user projects via `create-projects.sh` (edit USERS array first). Apply quota per project.
7. **§5** Build `bob-cli-sidecar` Dockerfile, tag and push to `jenkins/bob-cli:latest`. Create `bob-cli-credentials` secret (post-Phase-2 naming). Grant Jenkins SA read on the secret.

---

## 7. Open decision before Phase 3: jenkins-agent image

His model uses public `maven:3.9-eclipse-temurin-17` + `origin-cli:latest` as separate containers in the pipeline pod. Our current lab Jenkinsfiles use a single custom `jenkins-agent` image.

Two paths:

- **Path A: Keep our `jenkins-agent` image alongside his model.** In Phase 3, also build + push `jenkins-agent` (from `k8s/openshift/jenkins-agent/Dockerfile`). Then our existing Lab 2 Jenkinsfile works unchanged on the new deploy.
- **Path B: Drop our `jenkins-agent` image, adopt his 3-container public-image model.** Edit `Jenkinsfile`, `Jenkinsfile.lab*solution`, `Jenkinsfile.test` pod specs to use three containers with public images. More upfront work, less maintenance long-term.

**Recommendation for Phase 3:** Path A. We're testing his deployment mechanism. Switching pod specs at the same time adds a second moving part to debug if something fails. Do Path A first, validate, then if it works consider Path B as a follow-up.

**User has NOT yet chosen — confirm before Phase 3.**

---

## 8. Phase 4 — Smoke test (user executes)

Three validations on the fresh deploy:

### 4.1 Per-user credential store works

- Log in as `user1`
- `user1` (top-right) → Credentials → User → Global → Add Credentials → GitHub PAT with ID `user1-github-pat`
- Create a new pipeline job inside the `user1` folder
- **Confirm the PAT appears in the Credentials dropdown** of the pipeline config

This is the #1 feature we're adopting this setup for. If this works, the matrix-auth friction from previous sessions is resolved.

### 4.2 Pipeline runs on the user's branch

- Push a branch containing your Lab 2 work (`.bob/custom_modes.yaml`, `.bob/rules-*/`, `Jenkinsfile` with unit-test + Bob analysis stages)
- Point the `user1` pipeline at that branch
- Build Now

### 4.3 Bob invokes custom modes from the pushed workspace

- Watch the Bob Test Analysis stage
- Confirm: Bob loads the custom mode from `.bob/custom_modes.yaml`, produces the structured analysis in the banner
- Confirm: the archived `bob-analysis.md` artifact appears on the build page

If all three pass → Phase 5.
If any fail → diagnose before any deletions.

---

## 9. Phase 5 — Cleanup (ONLY after Phase 4 passes)

### 9.1 Hard-delete candidates (zero risk once Phase 4 passes)

| File/dir | Why |
|---|---|
| `k8s/openshift/jenkins-workshop/` | Our Jenkins deploy kit, superseded by Helm approach |
| `WORKSHOP_SETUP.md` | Superseded by `setup/INSTRUCTOR_SETUP_TZ.md` |
| `setup/INSTRUCTOR_SETUP_NotTZ.md` | Keep only TZ variant (TechZone is the target) |
| `setup/assets/template-jenkins-values_v1.yaml` | Superseded by `_v2.yaml` |
| `setup/assets/template-jenkins-values_rhcop.yaml` | Specialized for a platform we're not targeting |
| `setup/scripts/generate-htpasswd.sh` | Duplicate of the `.py` version |
| `setup/scripts/generate-jenkins-users.py` | Superseded by `_v2.py` |
| `labs/00_SETUP.md` | Needs rewrite for the new deploy (per-user folders vs shared Jenkins) — keep for now, rewrite after Phase 4 |

### 9.2 Conditional-delete candidates

| File/dir | Decision criterion |
|---|---|
| `setup/assets/template-jenkins-pipeline` | If participants follow our `Jenkinsfile.lab*solution` directly, his template is redundant. Delete after confirming. |
| `k8s/openshift/jenkins-agent/` | Delete if Path B is taken (§7). Keep if Path A. |

### 9.3 Do NOT delete (confirmed useful)

| File/dir | Reason |
|---|---|
| `setup/scripts/generate-security-setup.py` | Load-bearing per §4.1 — required by the doc to enable security post-install |
| `setup/scripts/generate-jenkins-users_v2.py` | Required for user creation step |
| `setup/scripts/generate-htpasswd.py` | Required if doing optional OCP user account creation |
| `setup/scripts/create-projects.sh` | Per-user OCP namespace provisioning |
| `setup/assets/template-jenkins-values_v2.yaml` | Helm values file — load-bearing |
| `setup/assets/workshop-user-project-quota.yaml` | Quota applied per user project |
| `setup/assets/jenkins-scc.yaml` | SCC binding |
| `setup/assets/job-template.xml` | Per-user job template — may be useful for automation |
| `setup/INSTRUCTOR_SETUP_TZ.md` | Canonical setup doc going forward |
| `k8s/openshift/bob-cli-sidecar/Dockerfile` | Our Bob image — the source of truth |
| `labs/LAB2_UNIT_TESTING.md`, `Jenkinsfile.lab*solution`, `.bob/rules-solution-*/` | Lab content |
| `README.md` | 5-lab framing — still correct |

---

## 10. File inventory reference

### 10.1 Current `setup/` contents (his work)

```
setup/
├── INSTRUCTOR_SETUP_NotTZ.md      606 lines — non-TechZone variant (delete Phase 5)
├── INSTRUCTOR_SETUP_TZ.md         521 lines — TechZone variant (KEEP, canonical)
├── assets/
│   ├── jenkins-scc.yaml            29 lines — KEEP
│   ├── job-template.xml            18 lines — KEEP
│   ├── template-jenkins-pipeline  118 lines — KEEP for now (example Jenkinsfile)
│   ├── template-jenkins-values_rhcop.yaml  41 lines — delete Phase 5
│   ├── template-jenkins-values_v1.yaml     61 lines — delete Phase 5
│   ├── template-jenkins-values_v2.yaml     39 lines — KEEP (Helm values)
│   └── workshop-user-project-quota.yaml    24 lines — KEEP
└── scripts/
    ├── create-projects.sh               35 lines — KEEP
    ├── generate-htpasswd.py             59 lines — KEEP
    ├── generate-htpasswd.sh             57 lines — delete Phase 5
    ├── generate-jenkins-users.py        65 lines — delete Phase 5
    ├── generate-jenkins-users_v2.py     67 lines — KEEP
    ├── generate-security-setup.py       60 lines — KEEP (load-bearing, not redundant)
    └── requirements.txt                  1 line — KEEP
```

### 10.2 Our work (still on main)

```
.bob/
├── custom_modes.yaml                    — has solution-code-reviewer, solution-pr-reviewer, solution-test-failure-analyzer, + user's Lab 2 modes
├── rules-solution-pr-reviewer/          — 3 .md files
├── rules-solution-test-failure-analyzer/ — 3 .xml files
└── mcp.json                             — empty

Jenkinsfile                              — base + Lab 2 (unit tests + Bob analysis, with --hide-intermediary-output + echo banner)
Jenkinsfile.lab1solution                 — base
Jenkinsfile.lab2solution                 — base + PR review (Lab 1) + Unit Tests + Bob Test Analysis
Jenkinsfile.lab3solution                 — base (placeholder)
Jenkinsfile.lab4solution                 — base (placeholder)
Jenkinsfile.finalsolution                — base (placeholder)
Jenkinsfile.test                         — smoke test (compile + bob mode sanity check)

labs/
├── README.md                            — index pointing at 00_SETUP.md + LAB<N>_*.md
├── 00_SETUP.md                          — participant setup; will need rewrite after Phase 4
└── LAB2_UNIT_TESTING.md                 — 6-part walkthrough (test-writer mode → mvn test stage → failure-analyzer mode → break test → demo)

k8s/openshift/
├── bob-cli-sidecar/Dockerfile           — our Bob CLI image (USE for Phase 3 build, tagged as `bob-cli`)
├── jenkins-agent/Dockerfile             — custom Maven+JDK image (Path A in §7)
└── jenkins-workshop/                    — our Groovy-init Jenkins deploy (superseded; delete Phase 5)

WORKSHOP_SETUP.md                        — our instructor doc (superseded; delete Phase 5)
README.md                                — 5-lab framing (KEEP)
order-service/                           — Spring Boot app, subject of all labs (KEEP)
```

---

## 11. Key commands & references

### 11.1 Start a fresh session

```bash
# Confirm you're on the right branch
git branch --show-current     # should be: adopt-instructor-setup

# Confirm main has both sides' work
git log --oneline main -10    # expect: merge commits for both PRs

# Check for uncommitted state
git status --short
```

### 11.2 Build Bob image from our Dockerfile, push as `bob-cli`

```bash
cd k8s/openshift/bob-cli-sidecar
podman build -t bob-cli:latest .
podman login -u $(oc whoami) -p $(oc whoami -t) image-registry.openshift-image-registry.svc:5000
podman tag bob-cli:latest image-registry.openshift-image-registry.svc:5000/jenkins/bob-cli:latest
podman push image-registry.openshift-image-registry.svc:5000/jenkins/bob-cli:latest
```

### 11.3 Create `bob-cli-credentials` secret (post-Phase-2 naming)

```bash
oc create secret generic bob-cli-credentials \
  --from-literal=BOBSHELL_API_KEY=<your-bob-api-key> \
  -n jenkins
```

---

## 12. For the next session

- **Don't over-engineer.** We've decided to keep his image name (`bob-cli`) and build from our Dockerfile. Don't propose renaming his image to `bob-cli-sidecar` everywhere.
- **Don't delete files before Phase 4 passes.** The user was explicit about this.
- **Follow the commit pacing rule.** Do a phase's edits, show the diff, wait for "committed" before starting the next phase.
- **Path A vs Path B decision (§7) is still open.** Ask the user before Phase 3.
- **Verify commands, don't assume.** If unsure which env var Bob CLI reads, grep the bob-cli Dockerfile or test quickly. Our working deployments used `BOBSHELL_API_KEY`.
