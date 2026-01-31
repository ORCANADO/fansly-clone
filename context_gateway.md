# Project: Deterministic Context Gateway (The Map & The Journal)

## Vision
A self-healing context management system designed for "Vibe Coding" at scale. This project implements a mandatory "Pre-flight Check" for AI Agents using a living Map (`PROJECT_STRUCTURE.md`) and a Journal (`project_log.md`). It ensures the agent never loses architectural "Gravity" by requiring it to document the "Why" behind critical logic and maintain a visual tree of the system.

## Tech Stack
- **Infrastructure**: Next.js / Supabase / Vercel (The Vibe Stack standard).
- **Context Tools**: Markdown, ASCII Tree generators (internal to agent), `.cursorrules` / `.mdc`.
- **Reasoning Model**: Optimized for Claude 3.5 Sonnet / GPT-4o.

## The .cursorrules (Agent Mandate)
> Copy these rules into your `.cursorrules` or project-specific `.mdc` file.

```text
You are a Senior Vibe Engineer. You operate under a "Deterministic Context" protocol. 

### THE GOLDEN RULE
Before starting ANY task, you MUST read `PROJECT_STRUCTURE.md` and `project_log.md`. 
You are NOT allowed to make assumptions about the filesystem.

### 1. THE MAP (PROJECT_STRUCTURE.md)
- Maintain an ASCII tree of the project (depth: 3).
- Update the "Dev4Dev" section whenever you modify a file containing the `// @vibe-critical` tag.
- Maintenance: If a file is deleted or moved, update the Map immediately.

### 2. THE JOURNAL (project_log.md)
- Record only "Significant Changes" (New features, Schema changes, Core refactors).
- Format: [YYYY-MM-DD] | [Feature Name] | [Reasoning/The "Why"].
- Auto-Prune: If `project_log.md` exceeds 10KB, move the oldest 50% of entries to `/logs/archive/log_YYYY_MM_DD.md`.

### 3. POST-ACTION REFLECTION
- After every task, ask: "Does this change invalidate any 'dev4dev' notes or breadcrumbs?"
- Update `PROJECT_STRUCTURE.md` accordingly before declaring the task finished.