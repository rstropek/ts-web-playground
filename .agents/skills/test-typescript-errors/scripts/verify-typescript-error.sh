#!/usr/bin/env bash
set -euo pipefail

SOURCE_CODE="${1:-let myVar: number = \"42\";}"
EXPECTED_DIAGNOSTIC="${2:-Type 'string' is not assignable to type 'number'.}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
CLIENT_DIR="$REPO_ROOT/client"
PLAYWRIGHT_BIN="${PLAYWRIGHT_BIN:-playwright-cli}"
SESSION_NAME="ts-error-check-$$-$RANDOM"
SERVER_PID=""
SERVER_LOG=""
PLAYWRIGHT_ARTIFACT_DIR="$(mktemp -d -t ts-playwright-cli.XXXXXX)"
PLAYWRIGHT_CONFIG="$PLAYWRIGHT_ARTIFACT_DIR/cli.config.json"
printf '{"outputDir":"%s","outputMode":"stdout"}\n' \
  "$PLAYWRIGHT_ARTIFACT_DIR" >"$PLAYWRIGHT_CONFIG"

cleanup() {
  "$PLAYWRIGHT_BIN" -s="$SESSION_NAME" close >/dev/null 2>&1 || true

  if [[ -n "$SERVER_PID" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" >/dev/null 2>&1 || true
  fi

  if [[ -n "$SERVER_LOG" && -f "$SERVER_LOG" ]]; then
    rm -f "$SERVER_LOG"
  fi

  rm -rf "$PLAYWRIGHT_ARTIFACT_DIR"
}
trap cleanup EXIT

if ! command -v "$PLAYWRIGHT_BIN" >/dev/null 2>&1; then
  echo "ERROR: playwright-cli is not installed or not on PATH." >&2
  exit 2
fi

if [[ ! -d "$CLIENT_DIR/node_modules" ]]; then
  echo "ERROR: client/node_modules is missing. Install the client dependencies first." >&2
  exit 2
fi

if [[ -n "${PLAYGROUND_URL:-}" ]]; then
  APP_URL="${PLAYGROUND_URL%/}/"
else
  PORT="${TS_PLAYGROUND_PORT:-5173}"
  APP_URL="http://127.0.0.1:$PORT/playground/"
  SERVER_LOG="$(mktemp -t ts-playground-vite.XXXXXX.log)"

  (
    cd "$CLIENT_DIR"
    npm run dev -- --host 127.0.0.1 --port "$PORT" --strictPort >"$SERVER_LOG" 2>&1
  ) &
  SERVER_PID=$!

  for _ in $(seq 1 100); do
    if curl --fail --silent --show-error "$APP_URL" >/dev/null 2>&1; then
      break
    fi
    if ! kill -0 "$SERVER_PID" >/dev/null 2>&1; then
      echo "ERROR: Vite exited before becoming ready." >&2
      sed -n '1,160p' "$SERVER_LOG" >&2
      exit 2
    fi
    sleep 0.1
  done

  if ! curl --fail --silent --show-error "$APP_URL" >/dev/null 2>&1; then
    echo "ERROR: Vite did not become ready at $APP_URL." >&2
    sed -n '1,160p' "$SERVER_LOG" >&2
    exit 2
  fi
fi

EXERCISE_URL='https://raw.githubusercontent.com/rstropek/ts-web-playground/refs/heads/main/exercises/emptyPlayground.yaml'
TARGET_URL="${APP_URL}?exerciseUrl=${EXERCISE_URL}"

"$PLAYWRIGHT_BIN" -s="$SESSION_NAME" open --config="$PLAYWRIGHT_CONFIG" about:blank >/dev/null
"$PLAYWRIGHT_BIN" -s="$SESSION_NAME" goto "$TARGET_URL" >/dev/null
"$PLAYWRIGHT_BIN" -s="$SESSION_NAME" run-code \
  "async page => { await page.getByRole('code').click(); }" >/dev/null
"$PLAYWRIGHT_BIN" -s="$SESSION_NAME" press Control+A >/dev/null
"$PLAYWRIGHT_BIN" -s="$SESSION_NAME" type "$SOURCE_CODE" >/dev/null

if ! "$PLAYWRIGHT_BIN" -s="$SESSION_NAME" run-code \
  "async page => { await page.getByRole('button', { name: 'Run' }).click(); await page.locator('.compiler-error').waitFor({ state: 'visible', timeout: 15000 }); }" >/dev/null; then
  echo "FAIL: the app did not render a compiler diagnostic." >&2
  "$PLAYWRIGHT_BIN" -s="$SESSION_NAME" snapshot >&2 || true
  exit 1
fi

RAW_DIAGNOSTIC="$(
  "$PLAYWRIGHT_BIN" -s="$SESSION_NAME" --raw eval \
    "document.querySelector('.compiler-error')?.textContent ?? ''"
)"
ACTUAL_DIAGNOSTIC="$(
  printf '%s' "$RAW_DIAGNOSTIC" | node -e \
    'let input = ""; process.stdin.setEncoding("utf8"); process.stdin.on("data", chunk => input += chunk); process.stdin.on("end", () => process.stdout.write(JSON.parse(input)));'
)"

if [[ "$ACTUAL_DIAGNOSTIC" != *"$EXPECTED_DIAGNOSTIC"* ]]; then
  echo "FAIL: rendered diagnostic did not contain the expected text." >&2
  echo "Source: $SOURCE_CODE" >&2
  echo "Expected substring: $EXPECTED_DIAGNOSTIC" >&2
  echo "Actual: $ACTUAL_DIAGNOSTIC" >&2
  exit 1
fi

echo "PASS: TypeScript error was rendered by the playground."
echo "$ACTUAL_DIAGNOSTIC"
