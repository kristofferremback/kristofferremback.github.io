---
name: blog-feedback
description: Provide editorial feedback on a blog post. Use when the user wants feedback on their writing.
argument-hint: [path-to-post]
allowed-tools: Read, Glob, Grep
---

# Blog Post Feedback

Provide editorial feedback on the blog post at `$ARGUMENTS`. If no argument is provided, ask the user which post to review.

## Guiding Principles

1. **Respect the author's voice** - The posts are intentionally casual and conversational. Do NOT suggest making things more formal or "article-like". Only flag tone issues when something feels inconsistent with the rest of the post.

2. **Be specific and actionable** - Reference specific paragraphs or sentences. "This section feels slow" is useless. "The three paragraphs about X repeat the same point - the first sentence says it best" is useful.

3. **Identify opportunities, not just problems** - Spot where a point could land harder, where a tangent adds charm vs. loses the reader.

4. **Focus on the writing, not the writer** - Feedback addresses what's on the page.

## Feedback Structure

Provide feedback in this format:

```markdown
## Overview

| Area | Status |
|------|--------|
| Structure & Flow | ✓ Good / ⚠ Needs work / ✗ Major issues |
| Language (British → American) | ✓ Clean / ⚠ X instances found |
| Clarity | ✓ Tight / ⚠ Could tighten |
| Voice & Tone | ✓ Consistent / ⚠ Inconsistent |

**Summary**: [1-2 sentences: main strength, primary issue if any]

---

## Suggested Improvements

[Only list items that need attention. Each item should be actionable.]

### 1. [Short title]

**Location**: [line number or quote snippet]

**Issue**: [What's wrong, briefly]

**Suggestion**: [Concrete fix or alternative]

### 2. [Next item...]

[Continue for each issue worth addressing]

---

## British → American English

[If any found, list as a simple table:]

| Found | Line | American |
|-------|------|----------|
| "whilst" | 42 | "while" |

[If none: "None found."]
```

### Reference: British vs American patterns to check

| Pattern | British | American |
|---------|---------|----------|
| -our/-or | colour, favour, honour | color, favor, honor |
| -re/-er | centre, theatre, metre | center, theater, meter |
| -ise/-ize | realise, organise | realize, organize |
| -yse/-yze | analyse, paralyse | analyze, paralyze |
| Double L | travelled, cancelled | traveled, canceled |
| -ence/-ense | defence, offence | defense, offense |
| Other | whilst, amongst, towards | while, among, toward |

## What NOT to Do

- Do not rewrite in a different voice
- Do not add formality to casual writing
- Do not suggest restructuring into a "proper article" format
- Do not nitpick intentionally casual grammar (fragments for effect, starting with "And", contractions, etc.)
- Do not pad feedback - if there are no issues, don't invent them
- Do not explain things that are fine - only detail what needs improvement
- Keep the overview scannable; put detail in the Suggested Improvements section
