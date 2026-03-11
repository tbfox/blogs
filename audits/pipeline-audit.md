# Blog Pipeline Audit
_Date: 2026-03-10_

## Current State

### Purpose

The pipeline is a transparency-first publishing workflow. Every stage is committed separately and labeled clearly so readers can trace how an article evolved. The AI handles scaffolding (structure, prose); the human handles judgment, voice, and final sign-off. `article-stages.md` is the canonical description of this workflow and is itself a live example — its own commit history demonstrates every stage.

The two human gates are deliberate and non-negotiable:
- **HUMAN_PLAN** — author revises the AI-generated plan before any prose is written
- **FINAL** — author reads and edits the AI draft before it publishes

### Agents & Commands in `.claude/`

| File | Type | Role |
|---|---|---|
| `agents/voice-to-blog-planner.md` | Agent | Transcript → structured plan |
| `agents/blog-writer.md` | Agent | Plan → prose draft |
| `agents/article-editor.md` | Agent | Editorial review of draft |
| `commands/plan-feedback.md` | Command | Iterates on plan with user feedback |

### Pipeline Stages (from CLAUDE.md)

| Stage | Label | Meaning |
|---|---|---|
| `STUB` | Stub | Reserved, no content |
| `RAW_RECORDING` | Raw Recording | Unedited voice transcript |
| `AI_PLAN` | AI-Generated Plan | voice-to-blog-planner output |
| `HUMAN_PLAN` | Human-Audited Plan | Author reviewed/improved plan |
| `AI_DRAFT` | AI-Generated Draft | blog-writer output |
| `FINAL` | Human-Reviewed Draft | Author edited — publish-ready |

---

## Critical Gaps (pipeline breaks without these)

---

## Human-in-the-Loop Gaps (intentional pauses need to be explicit)

The two deliberate human review moments are:

- **HUMAN_PLAN** — author reads and improves the AI plan before writing begins
- **FINAL** — author reads and edits the AI draft before publishing

These checkpoints are currently invisible. The pipeline stops and there's no signal about why or what to do next. The `plan-feedback` command helps with HUMAN_PLAN but only if you know to reach for it.

---

## Recommended Commands to Create

| Command | Automates | Stage Transition |
|---|---|---|
| `/new-article <slug> "<title>"` | Create stub article file | → `STUB` (or `RAW_RECORDING` with transcript) |
| `/plan-article <slug>` | Run voice-to-blog-planner on file | `RAW_RECORDING` → `AI_PLAN` |
| `/write-article <slug>` | Run blog-writer on file | `HUMAN_PLAN` → `AI_DRAFT` |
| `/review-article <slug>` | Run article-editor on file | `AI_DRAFT` → editorial feedback |
| `/publish <slug>` | Add slug to config.json | `FINAL` → visible on site |
| `/pipeline-status` | Show all articles by stage | (read-only dashboard) |

---

## Ideal Automated Pipeline (with human gates)

```
/new-article <slug> "<title>"
  └─ Creates stub → paste in transcript → stage: RAW_RECORDING

/plan-article <slug>                         [AUTOMATED]
  └─ voice-to-blog-planner runs
  └─ stage: RAW_RECORDING → AI_PLAN

  *** HUMAN GATE: review plan, use /plan-feedback to iterate ***
  *** manually set stage: HUMAN_PLAN when satisfied ***

/write-article <slug>                        [AUTOMATED]
  └─ blog-writer runs
  └─ stage: HUMAN_PLAN → AI_DRAFT

  *** HUMAN GATE: read and edit the draft ***
  *** use /review-article for editorial feedback if needed ***
  *** manually set stage: FINAL when satisfied ***

/publish <slug>                              [AUTOMATED]
  └─ adds to config.json all_visible_articles
```

---

## Implementation Priority

1. **Create `/plan-article` and `/write-article`** — thin wrappers that trigger agents (15 min each)
