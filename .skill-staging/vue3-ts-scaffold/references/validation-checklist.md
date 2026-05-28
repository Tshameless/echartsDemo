# Validation Checklist

Run the strongest checks the environment allows after scaffold generation.

## Empty directory initialization

Expected outcomes:

- files from the chosen preset are present
- package scripts exist for `lint`, `type-check`, and `build`
- the generated route entrypoints are wired

## Commands

Use the repo scripts when present. For preset-generated projects, expect:

```bash
pnpm lint
pnpm lint:style
pnpm type-check
pnpm build
```

`pnpm format` is a maintenance command and does not need to run as part of initialization verification.

## Admin preset runtime checks

Verify that:

- login route exists
- authenticated routes are guarded
- forbidden and not-found pages are reachable
- the example route is mounted under the admin layout

## Core preset runtime checks

Verify that:

- the home route renders
- the secondary route resolves through the router

## Reporting

Always report:

- commands actually run
- commands skipped
- whether skips were due to missing dependencies, network restrictions, or user choice
