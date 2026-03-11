---
name: new-article
description: Creates a new article stub. Usage: /new-article <slug> "<title>"
---

Create a new article file at `articles/$ARGUMENTS.md` (where `$ARGUMENTS` is the slug provided by the user, e.g. `my-article-slug`).

If the user provided both a slug and a title (e.g. `/new-article my-slug "My Title"`), parse them accordingly. If only a slug was provided, use the slug converted to title case as the title.

The file should contain only this frontmatter with no body content:

```
---
title: <title>
date: <today's date in MM-DD-YYYY format>
description:
stage: STUB
---
```

Leave `description` blank — the author will fill it in.

After creating the file, confirm the path and remind the user that the next step is to paste in a voice transcript and set `stage: RAW_RECORDING`, then run `/plan-article` when ready.
