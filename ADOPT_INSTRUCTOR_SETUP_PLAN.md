# Adopt Instructor Setup — Plan

> **Status:** Phase 1 is complete and verified end-to-end on a fresh TechZone cluster. A fresh instructor can now follow `setup/INSTRUCTOR_SETUP_TZ.md` top-to-bottom with the default `jenkins` namespace and get a working Jenkins + Bob setup with per-user folder credential isolation and shared-workspace pipelines that load custom modes. **This plan is the work remaining** to retire superseded files and bring the workshop Jenkinsfiles + lab docs up to the new deploy.

**Branch:** `adopt-instructor-setup`.

**Commit style:** group related changes into functionally-scoped commits. A commit should represent one logical concern — it can span multiple files if they share that concern, and it can touch part of a file if other concerns in that file belong in a different commit. Don't split for the sake of splitting. After each commit, stop and wait for explicit "committed" before the next one. Don't amend, don't force-push.

---

## 1. Work sequence

Three phases. Commit letters preserved from the original plan so conversation history stays consistent (commits A–D from Phase 1 are done, commit J was absorbed into the earlier `k8s/` delete).

---

### Phase 1 — archive superseded `setup/` files

Move files inside `setup/` that we don't use today into a new `setup/archive/` tree. Keeps them tracked in git, out of the active path, easy to revive if we pivot (e.g., to an OCP-Gym-based TechZone instance needing the non-TZ tooling back).

Target layout:

```
setup/archive/
├── README.md                           (explains what's here and why)
├── INSTRUCTOR_SETUP_NotTZ.md
├── scripts/                            (NotTZ-only scripts)
│   ├── generate-htpasswd.sh
│   ├── generate-htpasswd.py
│   ├── requirements.txt
│   └── generate-jenkins-users.py       (v1 JCasC-YAML variant)
└── assets/                             (superseded values templates + unused job template)
    ├── template-jenkins-values_v1.yaml
    ├── template-jenkins-values_rhcop.yaml
    └── job-template.xml
```

| # | Commit | What happens |
|---|---|---|
| E | **Fix stale doc references** | Update `README.md` "Starting Points" section — it links to `WORKSHOP_SETUP.md` which was deleted. Re-point at `setup/INSTRUCTOR_SETUP_TZ.md`. Update `README.md`'s "Repository Layout" to drop the `k8s/openshift/...` tree (also deleted). Scan `labs/README.md` for references to `k8s/openshift/jenkins-agent/Dockerfile` and update / remove. |
| F | **Archive the non-TechZone variant and its tooling** | `git mv setup/INSTRUCTOR_SETUP_NotTZ.md setup/archive/` + `git mv setup/scripts/generate-htpasswd.sh setup/archive/scripts/` + `git mv setup/scripts/generate-htpasswd.py setup/archive/scripts/` + `git mv setup/scripts/requirements.txt setup/archive/scripts/` + `git mv setup/scripts/generate-jenkins-users.py setup/archive/scripts/` (v1 JCasC-YAML variant) + create `setup/archive/README.md` with a short "what's here and why" explanation |
| G | **Archive superseded Helm values templates** | `git mv setup/assets/template-jenkins-values_v1.yaml setup/archive/assets/` + `git mv setup/assets/template-jenkins-values_rhcop.yaml setup/archive/assets/` |
| H | **Archive unused job template** | `git mv setup/assets/job-template.xml setup/archive/assets/` |

### Keep in the active tree

| File / dir | Reason |
|---|---|
| `setup/INSTRUCTOR_SETUP_TZ.md` | Canonical setup doc |
| `setup/assets/template-jenkins-values_v2.yaml` | Helm values file |
| `setup/assets/jenkins-scc.yaml` | SCC ClusterRoleBinding template |
| `setup/assets/workshop-user-project-quota.yaml` | Per-user quota |
| `setup/scripts/generate-security-setup.py` | Post-install security bootstrap |
| `setup/scripts/generate-jenkins-users_v2.py` | User creation via Groovy |
| `setup/scripts/create-projects.sh` | Per-user OpenShift namespace provisioning |
| `setup/scripts/teardown.sh` | Companion teardown script for a Jenkins + workshop deploy |
| `setup/bob-cli/Dockerfile` | Our Bob image |
| `Jenkinsfile.test` | Smoke test; re-run to catch regressions |
| `Jenkinsfile`, `Jenkinsfile.lab*solution`, `Jenkinsfile.finalsolution`, `labs/`, `order-service/`, `.bob/`, `README.md` | Workshop content; handled in Phase 2 |

---

### Phase 2 — migrate Jenkinsfiles + participant docs

Every existing Jenkinsfile other than `Jenkinsfile.test` still uses a 2-container pod spec referencing the deleted custom `jenkins-agent` image. Migrate them to the 3-container public-images pattern (`build-tools` + `oc-tools` + `bob`) that was proved during Phase 1 verification. Then fill in lab content cumulatively.

| # | Commit | Scope |
|---|---|---|
| I | **Migrate all Jenkinsfiles to 3-container pod spec** | Sweep edit across `Jenkinsfile`, `Jenkinsfile.lab1solution`, `Jenkinsfile.lab2solution`, `Jenkinsfile.lab3solution`, `Jenkinsfile.lab4solution`, `Jenkinsfile.finalsolution`. Replace the 2-container pod spec with the 3-container pattern (explicit `workspace-volume` + `workingDir: /workspace` + `HOME=/workspace` on every container). Match the shape of `Jenkinsfile.test`. No stage changes. Also settle the namespace inconsistency (`fis-bobathon-test` vs `fis-bobathon` — pick one canonical value, or parameterize). |
| K | **Rewrite `labs/00_SETUP.md` for the new deploy** | New credential pattern (`userN` / `userNWorkshop2024!`), folder-scoped navigation (homepage → `userN` folder → Credentials sidebar → **(global)** under "Stores scoped to userN" → Add Credentials, ID `userN-github-pat`), and pipeline-creation steps (Pipeline script from SCM, branch, `Jenkinsfile`). Fold in the previously-deferred "Add a GitHub PAT" walkthrough here instead of the instructor doc, including the note that "Scope: Global" in the credential dialog refers to URL matching, not visibility. |
| L | **Lab 1 — PR review cumulative** | Add the Lab 1 (PR review) stage to `Jenkinsfile.lab1solution`, `.lab2solution`, `.lab3solution`, `.lab4solution`, `.finalsolution`. Write `labs/LAB1_PR_REVIEW.md`. |
| M | **Lab 2 — unit tests cumulative** | Verify / rebuild Lab 2 stage in `.lab2solution` through `.finalsolution` (currently `.lab2solution` has Lab 2 only; needs Lab 1 after commit L). `labs/LAB2_UNIT_TESTING.md` exists — review and adjust if needed. |
| N | **Lab 3 — security scanning cumulative** | Add Lab 3 stage to `.lab3solution`, `.lab4solution`, `.finalsolution`. Write `labs/LAB3_SECURITY_SCANNING.md`. |
| O | **Lab 4 — linting cumulative** | Add Lab 4 stage to `.lab4solution`, `.finalsolution`. Write `labs/LAB4_LINTING.md`. |
| P | **Lab 5 — DCR + Jira** | Add Lab 5 stage to `.finalsolution`. Write `labs/LAB5_DCR_REPORTING.md`. Register the Jira MCP server in `.bob/mcp.json`. |

Commits L–P can be owned by lab leads rather than done all at once; the plan just tracks that they're outstanding.

---

### Phase 3 — retire this planning doc

| # | Commit | What happens |
|---|---|---|
| Q | **Remove `ADOPT_INSTRUCTOR_SETUP_PLAN.md`** | Delete this file. `DRY_RUN_PLAN.md`, `CHANGES_NEEDED.md`, and `WORKSHOP_SETUP.md` are already gone. |

Do this last, once Phase 2 is complete and nothing else references it.

---

## 2. For the next session

- **Trust the cluster over memory.** If an edit references something that doesn't match live state, check `git log` and the cluster before acting.
- **Commit pacing.** One commit per functional concern. Wait for "committed" between commits.
