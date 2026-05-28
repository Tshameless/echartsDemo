# Preset: admin-element-plus

This is the default scaffold preset.

## Intent

Generate a ready-to-extend admin shell that is useful on day one and stable enough for Codex to reproduce without guessing.

## Required capabilities

- Vue 3 + TypeScript + Vite
- `pnpm` scripts for dev, lint, style lint, type-check, build, and format
- `Element Plus` configured once at app startup with `zh-cn` locale
- `Pinia` store setup
- `Vue Router` with lazy-loaded views
- token storage utility and global auth guard
- unified `Axios` request layer for future API integration
- `403` and `404` pages
- one complete example module with route, types, composable, components, and empty/error handling

## Required template files

At minimum, the preset asset tree should include:

- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `env.d.ts`
- lint, prettier, and stylelint config
- `src/main.ts`
- `src/App.vue`
- `src/router/*`
- `src/stores/*`
- `src/utils/request.ts`
- `src/plugins/elementPlus.ts`
- `src/layouts/AdminLayout.vue`
- `src/views/auth/LoginView.vue`
- `src/views/error/ForbiddenView.vue`
- `src/views/error/NotFoundView.vue`
- `src/views/example/*`

## Default contracts

- locale is `zh-cn`
- login page exists even if login is mock-backed initially
- example module remains in the scaffold as the copy template for future business modules
- `Axios` layer exists even if the demo module does not require a live backend to render
