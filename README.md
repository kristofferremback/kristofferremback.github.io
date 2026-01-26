# kristofferremback.github.io

Personal website. Blog posts, recipes, and whatever else comes to mind.

Built with [Astro 5](https://astro.build) and [Tailwind CSS v4](https://tailwindcss.com). Deployed to GitHub Pages.

## Development

```sh
bun install
bun dev       # localhost:4321
bun build     # production build to ./dist/
```

## LLM-friendly endpoints

- `/ai/blog/[id]` and `/ai/recipes/[id]` return raw markdown
- `/llms.txt` lists all available AI endpoints
