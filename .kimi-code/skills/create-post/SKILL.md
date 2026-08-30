---
name: create-post
description: Scaffold a new photography-journal or writings post. Creates src/content/{folder}/{yyyy-mm-dd}-{slug}/index.mdx with frontmatter populated. Use when the user asks to create a new post, new journal entry, or new writing.
---

# Instructions

Arguments: `<folder> <slug>`

- `folder`: must be exactly `photography-journal` or `writings` (no other values accepted — reject anything else, including `adoption`)
- `slug`: the post folder slug WITHOUT the date prefix (e.g. `my-new-post`, not `2026-04-23-my-new-post`)

## Steps

1. Parse the two args. If the folder is not `photography-journal` or `writings`, stop and tell the user.
2. Get today's date in `yyyy-mm-dd` format from the environment context (`Today's date is …` line in the system prompt). Do NOT shell out to `date`.
3. Target path: `src/content/{folder}/{yyyy-mm-dd}-{slug}/index.mdx`.
4. Check whether that file already exists (use `Read`; if it returns content, the file exists). If it does, stop and tell the user — do not overwrite.
5. If it does not exist, use the `Write` tool to create `index.mdx` at the target path with the appropriate frontmatter template below. The `Write` tool creates the parent directory automatically.
6. Report the created path back to the user.

## Frontmatter Templates

Write the file contents verbatim, replacing `{yyyy-mm-dd}` with today's date. Leave `featuredImage` value blank — the Zod schema marks it optional, so the post still validates. All string fields are empty for the user to fill in.

### When `folder` is `photography-journal`

```mdx
---
title: ""
description: ""
date: {yyyy-mm-dd}
location: ""
country: ""
tags: []
featuredImage:
draft: false
---
```

### When `folder` is `writings`

```mdx
---
title: ""
description: ""
date: {yyyy-mm-dd}
featuredImage:
tags: []
draft: false
---
```

## Output

After creating the file, report only:

- The path that was created
- A one-line next-step hint (e.g. "Fill in title, description, and tags, then start writing.")

Keep the response short. Do not echo the frontmatter back.
