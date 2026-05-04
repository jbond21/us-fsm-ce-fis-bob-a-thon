# Lab 1 — PR / Git Diff Review with Bob

## Table of Contents

- [Overview of Lab 1](#overview-of-lab-1)
  - [What you'll build in Lab 1](#what-youll-build-in-lab-1)
- [Before you start](#before-you-start)
- [Part 1 — Add the `askBob` helper to your Jenkinsfile](#part-1--add-the-askbob-helper-to-your-jenkinsfile)
- [Part 2 — Build the `PR Review` stage with a simple prompt](#part-2--build-the-pr-review-stage-with-a-simple-prompt)
- [Part 3 — TBD: intermediate push & build?](#part-3--tbd-intermediate-push--build)
- [Part 4 — Upgrade `askBob` to accept an optional mode](#part-4--upgrade-askbob-to-accept-an-optional-mode)
- [Part 5 — Create the `pipeline-git-diff-overview` mode](#part-5--create-the-pipeline-git-diff-overview-mode)
  - [Key characteristics of this mode](#key-characteristics-of-this-mode)
- [Part 6 — Update the stage to use the new mode](#part-6--update-the-stage-to-use-the-new-mode)
- [Part 7 — Push and watch](#part-7--push-and-watch)
- [Stuck?](#stuck)

---

## Overview of Lab 1

You'll build a working pipeline stage with a plain prompt, see the limits of that, and then crystallize the behavior you want into a reusable Bob custom mode.

### What you'll build in Lab 1

1. **The `askBob` helper function** — your pipeline's reusable interface to Bob. You'll write it twice: a one-argument version first (just a prompt), then upgrade it to take an optional custom mode once you need one. Every subsequent lab calls this helper.

2. **A `PR Review` stage** — your first pipeline stage that calls `askBob`. You'll build it the cheap way first: hand Bob a one-line prompt and read the generic output. That generic output is the point — it sets up the contrast for what custom modes give you next.

3. **A custom Bob mode** (`pipeline-git-diff-overview`) — once you've felt the limits of a plain prompt, you'll use **Mode Writer** mode to build a reusable mode that produces structured, scannable output. The same stage now produces a senior-developer-style risk-ranked review without you having to spell that out in the prompt each time.

By the end, every push triggers a structured PR review in your Jenkins console — and you've practiced the prompt-then-mode loop you'll repeat for unit tests, security scans, and linting in the labs that follow.

---

## Before you start

- [ ] Lab 0 complete (branch created, pipeline pointed at it, one successful `Checkout`-only build)
- [ ] You're on your working branch (e.g. `user1-labs`)

---

## Part 1 — Add the `askBob` helper to your Jenkinsfile

Every stage of the pipeline that invokes Bob has to do the same two things: step into `container('bob')` and run `bob …`. Factor that out **once** and each stage just passes a prompt and gets back the analysis string to do whatever it wants with.

The code for this function is shared below. Paste the helper into your `@Jenkinsfile` at the bottom, **outside** the `pipeline { }` block:

```groovy
// ── Helper: ask Bob, optionally with a specific custom mode ───────────────────
// Writes the prompt to a tempfile in the shared workspace and runs `bob` in
// the bob container, adding `--chat-mode <slug>` only when a mode is provided.
// Returns the analysis as a string. Using a tempfile (instead of inlining the
// prompt on the command line) avoids shell-escaping issues when the prompt
// contains quotes, backticks, or newlines — common with diffs.
def askBob(String prompt, String mode = null) {
    container('bob') {
        def promptFile = ".bob-prompt-${System.currentTimeMillis()}.txt"
        writeFile file: promptFile, text: prompt

        def modeFlag = mode ? "--chat-mode ${mode}" : ""
        def analysis = sh(
            script: """bob ${modeFlag} -p "\$(cat ${promptFile})" --hide-intermediary-output""",
            returnStdout: true
        ).trim()

        sh "rm -f ${promptFile}"
        return analysis
    }
}
```

Once you've pasted the helper into your `@Jenkinsfile`, save the file, start a new task and switch to **Ask** mode. Ask bob:

```
Can you explain to me the key parts of the askBob function in @Jenkinsfile
```

The line that actually invokes Bob is:

```sh
bob ${modeFlag} -p "$(cat ${promptFile})" --hide-intermediary-output
```

Piece by piece:

- **`bob`** — the Bob CLI, available in the `bob` container.
- **`${modeFlag}`** — placeholder for the optional `--chat-mode <slug>` flag. When `askBob` is called with a second argument (a custom mode slug, e.g. `pipeline-git-diff-overview`), this expands to `--chat-mode pipeline-git-diff-overview` so Bob applies that mode's rules and tools. When no mode is passed, it's empty and Bob uses its built-in default. Custom modes are how you give a stage stable, structured output without spelling out the format in every prompt — you'll build one in Part 5.
- **`-p "..."`** — runs Bob in one-shot prompt mode: take this prompt, do the work, print the result to stdout, exit. No interactive chat.
- **`"$(cat ${promptFile})"`** — substitutes in the contents of a tempfile as the prompt. We go through a file (instead of inlining the prompt) because diffs and logs contain quotes, backticks, and newlines that wreck shell escaping.
- **`--hide-intermediary-output`** — suppresses Bob's tool-call traces and "thinking" output so we capture only the final analysis. Without this, `returnStdout` would pick up everything Bob printed about its thought process along the way.


Once you have a good understanding of how this helper works:

```
git commit -m "Add askBob helper to @Jenkinsfile"
git push
```

---

## Part 2 - Use Github MCP to analyze git diff. 

Start a new task and switch to Advanced mode. Ask Bob to find the PR then give you an overview of the diff from main. 

This overview of the diff is fine, but we can implement custom modes to get more detailed and better formatted information. 

## Part 3 - Create the `pipeline-git-diff-overview` mode

Part 2's overview was unstructured — fine for a one-off, noisy on every push. A custom mode pins the output shape and the read-only permissions a CI mode should have.

Start a new task, switch to **Mode Writer** mode, and paste:

```
Write a custom mode with slug `pipeline-git-diff-overview`. Append it to @.bob/custom_modes.yaml — don't overwrite anything else.

Job: senior dev glancing at a PR's git diff. Quick risk-oriented overview, not a full review. For each notable change:
  - 1–2 sentences on what changed
  - Risk: high / medium / low
  - Watch for: null-safety, concurrency, behavior changes, security surface, perf hot paths, missing tests

Output: plain text for a Jenkins console (no ANSI, no markdown tables). Sections: Summary, Risk, Watch for. Short — if nothing notable changed, say so in one sentence.

Tool groups: read only.

Add a rules directory with XML files capturing the output structure and observation priorities.
```

Read-only is deliberate — a pipeline mode should do the minimum it needs to. No IDE restart needed: Bob loads `custom_modes.yaml` fresh from the workspace on every pipeline run.

---

## Part 4 — Build the `PR Review` stage

Switch to the provided Jenkins Bob Integration mode. 

```
  Add a "PR Review" stage to @Jenkinsfile right after the Checkout stage. The stage should:

  - Compute the PR diff and write it to git-diff.txt
  - Call askBob with the pipeline-git-diff-overview mode and a short prompt
    asking it to read git-diff.txt and produce the overview
  - Save the analysis to bob-pr-review.md and archive it as a build artifact
  ```

---


## Part 7 — Push and watch

```bash
git add Jenkinsfile .bob/
git commit -m "Lab 1 — PR review stage with askBob helper + pipeline-git-diff-overview mode"
git push
```

In Jenkins, click **Build Now** on your pipeline and watch the console.

Expected:

- `Checkout` stage turns green
- `PR Review` stage runs next. The console shows your stage's banner (`Bob — PR Review` or however you wrote it) with Bob's summary / risk / watch-for output between the banner lines
- Build page lists `bob-pr-review.md` under **Build Artifacts**
- Pipeline ends SUCCESS

Open the archived artifact from the build page and you've got a persistent record of Bob's take on that commit — searchable in Jenkins's build history.

**Optional:** make a commit that does something a senior developer would flag — add a null-unchecked parameter, or a broad `catch (Exception e)` that swallows errors, or a hardcoded secret — push, and read Bob's output. Does the risk ranking match your intuition? Does Bob surface the thing you'd mention in a code review? Tune the mode's rules if not.

---

## Stuck?

- **Pipeline fails with something like `askBob: method not found`.** Your helper function is inside the `pipeline { }` block. Move it to the top level of the file (outside the `pipeline { }` braces).
- **Bob stage runs but says the mode wasn't found.** Check (a) `.bob/custom_modes.yaml` contains the slug `pipeline-git-diff-overview`, (b) you're passing that exact string to `askBob`, (c) you committed and pushed `.bob/`. Bob reads `custom_modes.yaml` fresh from the workspace on every run.
- **Part 2 stage works but the output is messy / inconsistent across runs.** Expected — that's the whole reason for Parts 4–6. Without a mode, you're relying on the prompt to enforce format every time, and the prompt in Part 2 is intentionally minimal.
- **The diff is empty.** Two common causes: (a) your branch hasn't diverged from `main` yet — there are no commits since the branch point — or (b) `origin/main` isn't available locally on the Jenkins agent (rare, but possible if the Git plugin's clone config was customized). Confirm by adding `git branch -r` to your shell step temporarily: it should list `origin/main` after `checkout scm`. If it doesn't, the agent isn't fetching `main`; you may need an explicit `git fetch origin main` before the diff.
- **Pipeline fails with `fatal: detected dubious ownership in repository`.** Git refuses to operate when the directory's owner UID doesn't match the user running git. The `build-tools` (maven) container runs as a different user than the one that owns the checked-out files. Fix: add `git config --global --add safe.directory "$WORKSPACE"` as the **first** command in your stage's shell step, before any other git invocation. Use `$WORKSPACE` rather than the `'*'` wildcard so you're only trusting the directory you actually need.
- **Bob says `git-diff.txt` "is not accessible from the current workspace directory".** This means your stage wrote the diff to an absolute path outside Bob's reachable directory tree — almost always `/workspace/git-diff.txt` instead of `git-diff.txt`. Bob's CWD is the Jenkins job workspace (`/workspace/workspace/<folder>/<job>/`), not the root of the shared volume; its tooling won't reach up out of its own workspace. Fix: write the diff to a **relative path** (`git-diff.txt`, no leading slash) and tell Bob to read the same relative path.
- **Bob output looks like a novel, not a triage summary.** The mode's rules file probably isn't constraining output length. Re-open Mode Writer and refine the rules to enforce brevity — cap per-change output to a few lines, require the three-section structure, tell Bob to skip uninteresting changes.
- **`Jenkinsfile` not working?** Copy `Jenkinsfile.lab1solution` from the repo root over your own `Jenkinsfile` and push. That's the reference state after Lab 1 and a safe reset point.

---

When you're ready, open [LAB2_UNIT_TESTING.md](LAB2_UNIT_TESTING.md).
