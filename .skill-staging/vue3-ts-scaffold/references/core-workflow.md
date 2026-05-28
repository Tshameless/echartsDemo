# Core Workflow

Use this workflow when the skill is selected.

## 1. Inspect the target first

Check at minimum:

- is the directory empty
- does `package.json` exist
- does a `src/` directory already exist
- does the repo already look like a Vite or Vue project

Classify the target as:

- `empty`: safe for full initialization
- `mostly-empty`: safe for initialization after confirming there is no conflicting app shell
- `existing-app`: do not overwrite by default

## 2. Choose the preset

Use these fixed defaults:

- `admin-element-plus` for generic Vue admin or dashboard requests
- `core-vite` for minimal or non-admin Vue starter requests

Do not ask the user to choose when the request already maps cleanly to one preset.

## 3. Generate from local assets

Prefer copying the preset asset tree directly from `assets/presets/<preset>/`.
Use the bundled files as the canonical scaffold source.

Allowed project identity adjustments:

- package name
- page titles
- API base URL placeholder

Do not redesign the template during initialization.

## 4. Install and validate

If package installation is possible, run:

```bash
pnpm install
pnpm lint
pnpm type-check
pnpm build
```

Also run `pnpm lint:style` when the preset exposes it.

If network access is blocked, keep the scaffold files and report that installation and runtime validation were skipped.

## 5. Report consistently

Include:

- target classification
- chosen preset
- generated capabilities
- commands attempted and outcomes
- follow-up items if installation or validation was blocked
