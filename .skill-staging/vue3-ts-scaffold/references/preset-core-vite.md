# Preset: core-vite

Use this preset for a minimal Vue 3 starter.

## Intent

Generate a clean TypeScript Vite app with a small routed shell and engineering checks, without pulling in admin architecture or UI framework decisions.

## Required capabilities

- Vue 3 + TypeScript + Vite
- Composition API with `<script setup lang="ts">`
- one small router setup
- one or two simple starter pages
- lint, style lint, type-check, build, and format scripts

## Explicit exclusions

Do not add these by default in this preset:

- Element Plus
- Pinia
- Axios request layer
- auth guard
- admin layout

## Required template files

At minimum, the preset asset tree should include:

- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `env.d.ts`
- lint, prettier, and stylelint config
- `src/main.ts`
- `src/App.vue`
- `src/router/index.ts`
- `src/views/HomeView.vue`
