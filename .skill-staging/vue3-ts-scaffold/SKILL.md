---
name: vue3-ts-scaffold
description: Initialize a Vue 3 + TypeScript project from bundled scaffold presets. Default to a ready-to-run admin scaffold with Vite, pnpm, Pinia, Vue Router, Axios, Element Plus, Chinese locale, auth guard, error pages, and an example module. Use when Codex should create a fresh Vue project or fill a mostly empty directory from stable local template assets instead of improvising the scaffold from scratch.
---

# Vue 3 TypeScript Scaffold

Use this skill to initialize a Vue 3 project from local preset assets.
Prefer copying and adapting the bundled template files under `assets/presets/` instead of inventing scaffold code during the task.

## Prompt Contract

Before generating files, determine these facts:

- whether the target directory is empty
- whether the user explicitly asked for a preset
- whether network access is available for dependency installation

If the target directory already contains a real app shell such as `package.json`, `src/`, or Vite config files, do not overwrite it by default.
In that case, either:

- fill only clearly missing scaffold pieces when the user asked for completion
- or stop and explain that this skill is optimized for fresh initialization

## Default Preset Selection

Use these fixed rules:

- default preset: `admin-element-plus`
- if the user asks for a minimal, base, starter, or non-admin Vue project, use `core-vite`
- if the user asks for a Vue admin or dashboard project and does not choose a preset, use `admin-element-plus`

Read these references before generating files:

- [core-workflow](references/core-workflow.md)
- [validation-checklist](references/validation-checklist.md)
- preset-specific reference for the chosen preset

Preset references:

- [admin-element-plus](references/preset-admin-element-plus.md)
- [core-vite](references/preset-core-vite.md)

## Presets

### `admin-element-plus`

Use `assets/presets/admin-element-plus` as the base project snapshot.

This preset must produce:

- Vue 3 + TypeScript + Vite
- `pnpm` scripts for `dev`, `build`, `lint`, `lint:style`, `type-check`, and `format`
- Pinia, Vue Router, and Axios
- Element Plus with `zh-cn` locale
- auth token utility and login guard
- `401/403/404` handling skeleton
- an admin layout and one example business module

### `core-vite`

Use `assets/presets/core-vite` as the base project snapshot.

This preset must produce:

- Vue 3 + TypeScript + Vite
- a small routed app with Composition API and `<script setup lang="ts">`
- engineering baseline files for lint, formatting, style lint, type-check, and build
- no admin auth layer, no Axios request layer, and no UI framework binding

## Execution Workflow

Follow this sequence unless the user explicitly asks for a different order:

1. Inspect the target directory and classify it as empty, mostly empty, or existing app.
2. Select the preset using the default rules.
3. Copy the preset files from `assets/presets/<preset>/` into the target directory.
4. Adapt obvious project identity fields such as package name when the target folder name is known.
5. If network access is available, install dependencies with `pnpm install`.
6. Run available validation commands from the checklist.
7. Report the chosen preset, generated capabilities, commands run, and anything left undone.

## Asset Usage Rules

- Treat the preset assets as the source of truth for scaffold contents.
- Prefer narrow adaptation over template rewrites.
- Keep Composition API and `<script setup lang="ts">`.
- Keep lazy-loaded page routes by default.
- Do not remove the example module from `admin-element-plus` unless the user explicitly asks for a slimmer template.
- When network installation is unavailable, still write the full scaffold and report that dependencies were not installed.

## Output Expectations

Always summarize:

- selected preset
- target directory classification
- whether dependencies were installed
- which validation commands ran
- which scaffold capabilities are present
- any blocked or skipped steps
