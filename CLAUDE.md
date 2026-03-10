# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a pure data repository containing blog articles as Markdown files. There is no build system, no dependencies, and no programming language — only content and configuration.

## Article Format

Each article is a `.md` file in the `articles/` folder with YAML frontmatter:

```
---
title: Article Title
date: MM-DD-YYYY
image: image-filename.ext
description: One-line summary
---

Article body in Markdown...
```

## Visibility & Configuration

`config.json` controls what appears on the site:

- `featured_articles`: Articles highlighted/promoted on the site (subset of visible)
- `all_visible_articles`: All articles shown to readers

Articles present in the repo but absent from `all_visible_articles` (e.g., `soc.md`) are hidden/archived from readers. Add an article's filename slug (no `.md`) to the appropriate arrays to publish it.

## Naming Conventions

- Article filenames: `kebab-case` (e.g., `term-bloat.md`)
- Images are referenced by filename only — they are stored externally, not in this repo
- Article slugs in `config.json` match filenames without the `.md` extension

## Article Stages

Each article has a `stage` field in its frontmatter indicating where it is in the publishing pipeline. Set this field to one of the following labels:

| Label | Stage | What readers see |
|---|---|---|
| `STUB` | Stub | Placeholder — article is reserved but has no content yet. Show an "under construction" notice. |
| `RAW_RECORDING` | Raw Recording | Unedited voice transcript dropped directly onto the page. No cleanup. |
| `AI_PLAN` | AI-Generated Plan | AI has organized the transcript into a structured outline. Pre-human, auto-generated. |
| `HUMAN_PLAN` | Human-Audited Plan | Author has reviewed and improved the AI-generated plan. |
| `AI_DRAFT` | AI-Generated Draft | AI has written prose from the human-audited plan. Auto-generated, unreviewed. |
| `FINAL` | Human-Reviewed Draft | Author has read and edited the AI draft. This is the finished article. |

Always set `stage` explicitly. Do not omit it. When creating a new article, start at `STUB`.

## Writing and Editing

For style, tone, and editorial guidance, use the `article-editor` agent. This agent handles all writing quality, structure, and revision tasks.
