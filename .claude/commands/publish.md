---
name: publish
description: Publishes a FINAL article by adding it to config.json. Usage: /publish <slug>
---

Publish the article identified by the slug in `$ARGUMENTS`.

## Steps

1. **Verify the article is ready**: Read `articles/$ARGUMENTS.md` and confirm `stage: FINAL` is set in the frontmatter. If it is not `FINAL`, stop and tell the user the current stage — do not publish.

2. **Check for duplicates**: Read `config.json` and confirm the slug is not already in `all_visible_articles`. If it is, tell the user and stop.

3. **Add to `all_visible_articles`**: Append the slug to the `all_visible_articles` array in `config.json`.

4. **Ask about featuring**: Ask the user if they want to add this article to `featured_articles` as well. If yes, append the slug to that array too.

5. **Confirm**: Report back with the slug that was published and the current contents of both arrays so the user can verify.
