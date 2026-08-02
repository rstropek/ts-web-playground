---
name: test-typescript-errors
description: Verify that the TypeScript Web Playground catches and displays compiler diagnostics for invalid TypeScript. Use when testing browser-side compilation, Monaco editor integration, Run-button behavior, diagnostic formatting, or regressions where TypeScript errors may be missing from the playground Console.
---

# Test TypeScript Errors

Test through the browser UI with Playwright CLI. Do not infer success from Monaco squiggles or from the compiler implementation alone: enter invalid code, click **Run**, and inspect the rendered `.compiler-error` output.

## Run the standard check

From the repository root, run:

```bash
.agents/skills/test-typescript-errors/scripts/verify-typescript-error.sh
```

The helper starts the Vite client and loads the real empty playground exercise from:

```text
https://raw.githubusercontent.com/rstropek/ts-web-playground/refs/heads/main/exercises/emptyPlayground.yaml
```

It then enters:

```ts
let myVar: number = "42";
```

It passes only when the app renders a diagnostic containing:

```text
Type 'string' is not assignable to type 'number'.
```

This deliberately exercises the app's normal exercise-loading path and requires network access to `raw.githubusercontent.com`. The helper closes its browser session and dev server when it exits.

## Test another diagnostic

Pass the source as the first argument and an expected diagnostic substring as the second:

```bash
.agents/skills/test-typescript-errors/scripts/verify-typescript-error.sh \
  'const count: number = true;' \
  "Type 'boolean' is not assignable to type 'number'."
```

Set `PLAYGROUND_URL` to reuse an already-running client instead of starting Vite:

```bash
PLAYGROUND_URL=http://127.0.0.1:5173/playground/ \
  .agents/skills/test-typescript-errors/scripts/verify-typescript-error.sh
```

Set `TS_PLAYGROUND_PORT` to change the helper-managed Vite port.

## Interpret the result

- Treat exit code `0` and the printed `PASS` diagnostic as success.
- Treat a missing or mismatched diagnostic as failure, even if JavaScript was emitted or the result iframe loaded. This playground reports diagnostics without blocking emit.
- Report the entered source and the actual rendered diagnostic when handing off results.
- If the helper cannot start, first check that `client/node_modules` exists, `playwright-cli` is installed, and the raw GitHub exercise URL is reachable. Obtain approval before installing missing dependencies.
