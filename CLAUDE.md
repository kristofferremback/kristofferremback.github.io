# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website built with **Astro 5** and **Tailwind CSS v4**, using **Bun** as the package manager. Blog-focused homepage with a recipes section. Static site output deployed to GitHub Pages.

## Commands

```bash
bun dev        # Start dev server at localhost:4321
bun run build  # Build production site to ./dist/
bun preview    # Preview production build locally
bun astro      # Run Astro CLI commands directly
```

## Architecture

- **Astro 5** with strict TypeScript (`astro/tsconfigs/strict`)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — dark mode uses class strategy (`.dark` on `<html>`)
- **`@tailwindcss/typography`** for prose styling in blog posts and recipes
- Standard Astro file-based routing: `src/pages/` maps to URL paths
- Layouts use `<slot />` for composition
- Static assets in `public/` are served as-is at the root URL

## Content Collections

Two collections defined in `src/content.config.ts` using Astro's Content Layer API with `glob` loader:

- **blog** (`src/content/blog/`): Posts with title, description, pubDate, tags, draft flag
- **recipes** (`src/content/recipes/`): Recipes with structured ingredients, macros, servings in frontmatter

Drafts: set `draft: true` in frontmatter. Filtered out in production builds, visible in dev.

## Routes

| Route | Source | Description |
|-------|--------|-------------|
| `/` | `src/pages/index.astro` | Blog post list (homepage) |
| `/blog/[id]` | `src/pages/blog/[...id].astro` | Individual blog post |
| `/recipes` | `src/pages/recipes/index.astro` | Recipe list |
| `/recipes/[id]` | `src/pages/recipes/[...id].astro` | Individual recipe with portion calculator |
| `/ai/blog/[id]` | `src/pages/ai/blog/[...id].ts` | Blog post as raw markdown (text/markdown) |
| `/ai/recipes/[id]` | `src/pages/ai/recipes/[...id].ts` | Recipe as raw markdown (text/markdown) |
| `/rss.xml` | `src/pages/rss.xml.ts` | RSS feed (blog only) |

## Dev Workflow

- **Do NOT start the dev server** (`bun dev`). Kris runs it separately. Use `bun run build` for verification.

## Key Patterns

- **Dark mode**: Blocking inline script in `<head>` reads `localStorage`, falls back to `prefers-color-scheme`. Toggle persists to `localStorage`.
- **Shiki themes**: Dual themes (`github-light`/`github-dark`) switched via CSS variables and `.dark` class.
- **Portion calculator**: Vanilla JS (`is:inline`) reads ingredient/macro data from `data-*` attribute, recalculates proportionally on servings change.
- **AI endpoints**: Static `.ts` files returning `text/markdown` content type for LLM consumption.
