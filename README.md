# TypeScript Web Playground

A teaching platform for introductory TypeScript through visual [p5.js](https://p5js.org/) exercises. Students edit one or more files in a Monaco-based browser IDE, compile TypeScript entirely in the browser, and run the emitted JavaScript in an iframe. The full platform adds exercise scheduling, Entra ID/TAN/anonymous login, teacher administration, and saving student work to per-user GitHub repositories.

This is a collection of independent npm projects, not a root npm workspace.

## System map

```text
Cosmos DB exercise metadata ──> Express/Handlebars menu
                                      │
                                      ▼
remote exercise YAML ──> Monaco models ──> browser TypeScript compiler
        │                                     │
        └── Markdown spec                     ▼
                                      generated blob iframe + p5.js
                                                │
authenticated student ──> Express ──> GitHub repository (one commit/file)

Azure Key Vault supplies Entra, Cosmos, Redis, reCAPTCHA, and GitHub secrets.
Redis stores sessions; Cosmos DB stores users and exercise metadata, not the YAML.
```

| Path | Role | Primary entry point |
| --- | --- | --- |
| `client/` | Vite SPA: Monaco editor, YAML loading, in-browser compilation, iframe output, local/cloud saves | `client/src/main.ts` |
| `server/` | Express app: menus, authentication, admin UI, proxies, GitHub persistence, and client reverse proxy | `server/src/main.ts` |
| `exercises/` | Versioned YAML exercise definitions, reference solutions, and media, grouped by topic | `exercises/emptyPlayground.yaml` |
| `exercises/devenv/` | Minimal Vite+p5.js project for developing or debugging a sketch outside the platform | `exercises/devenv/src/index.ts` |
| `github/` | Standalone GitHub API experiment with hard-coded sample targets; not used by the production app | `github/app.ts` |
| `.github/workflows/` | Path-filtered Docker builds pushed to Docker Hub with the `latest` tag | `client.yaml`, `server.yaml` |
| `devops/` | Deployment notes only; there is currently no complete infrastructure definition | `devops/playground.azcli` |

## Fast local workflows

The repository's Dockerfiles use Node.js LTS. Each project has its own lockfile, so run commands from the relevant directory.

### Develop an exercise sketch

This path needs no Azure or authentication infrastructure:

```bash
cd exercises/devenv
npm ci
npm start
```

Edit `src/index.ts`. To work on an existing solution, copy its `.ts` content into that file. The dev environment is intentionally independent of exercise YAML and the Monaco UI.

### Run the browser IDE by itself

```bash
cd client
npm ci
npm run dev
```

Open an exercise by passing its raw YAML URL:

```text
http://localhost:5173/playground/?exerciseUrl=https%3A%2F%2Fraw.githubusercontent.com%2Frstropek%2Fts-web-playground%2Fmain%2Fexercises%2F0010-Basics%2Fshapes.yaml
```

In this mode `/me` and `/github/*` have no backing server, so cloud save is unavailable and exercise loading falls back to a direct cross-origin request. All repository exercises use `{{p5Source}}` and therefore expect `/libs/p5.min.js`, which the Express server normally serves. To run their sketches from the client-only Vite server, expose the installed `p5/lib/p5.min.js` at that path on the client origin.

### Run the full platform

The full server cannot boot with local defaults alone. It authenticates to Azure using `DefaultAzureCredential`, reads all service credentials from Key Vault, and connects to Redis and Cosmos DB during startup.

After configuring the environment described below:

```bash
cd client
npm ci
npm run dev
```

In a second terminal:

```bash
cd server
npm ci
npm start
```

Then use `http://localhost:8080`. The server proxies `/playground` to `http://localhost:5173/playground` by default. VS Code's `Run` compound launch configuration starts both processes.

`npm start` in `server/` always builds first, and the build script copies `server/.env`; therefore that file must exist even when the actual values come from the process environment.

## Server configuration

Environment variables (loaded from `server/.env` when not already present in the process):

| Variable | Requirement / default |
| --- | --- |
| `KEY_VAULT_URL` | Required. Azure Key Vault used for every secret below. |
| `GH_ORG` | Required for repository creation and cloud saves. |
| `NODE_ENV` | Set to `development` to expose admin routes to any authenticated session; Docker sets `production`. |
| `PORT` | Optional, default `8080`; server Docker image sets `80`. |
| `CALLBACK_HOST` | Optional, default `http://localhost:8080`; base of the Entra callback URL. |
| `PROXY_TARGET` | Optional, default `http://localhost:5173`; target hosting the client. |
| `SECURE_COOKIE` | Optional, default `false`; set `true` behind HTTPS. |
| `OAUTH_REDIRECT_URI` | Used when silently acquiring Microsoft Graph tokens. |

The Azure identity must be able to read these Key Vault secrets:

| Secret | Purpose |
| --- | --- |
| `ENTRA-CLIENT-ID`, `ENTRA-CLIENT-SECRET`, `ENTRA-TENANT-ID` | Entra confidential client |
| `ENTRA-ADMIN-GROUP-ID` | Teacher/admin authorization |
| `COSMOS-URI`, `COSMOS-KEY` | Cosmos DB account; database `tsweb`, containers `Users` and `Exercises` are created if absent |
| `REDIS-HOSTNAME`, `REDIS-KEY`, `REDIS-SECRET` | TLS Redis connection and Express session signing |
| `RECAPTCHA-KEY`, `RECAPTCHA-SECRET` | Anonymous and TAN login protection |
| `GH-PAT` | Creating student repositories and committing saved files |

## Exercise format and lifecycle

An exercise is a remotely fetchable YAML document. The smallest useful shape is:

```yaml
title: "Example"
descriptionMd: |
  # Task
  Draw something.
sampleSolution: "https://raw.example/example.ts" # optional
files:
  "index.ts":
    content: |
      function setup() {}
      function draw() {}
    isEditable: true
  "index.html":
    content: |
      <!doctype html>
      <script src="{{p5Source}}"></script>
      {{topScripts}}
      {{bodyScripts}}
    isEditable: false
```

Important contracts:

- `index.ts` and `index.html` are assumed by the client and should always exist.
- All `.ts` files are compiled. Emitted scripts other than `index.js` replace `{{topScripts}}`; `index.js` replaces `{{bodyScripts}}`.
- `{{p5Source}}` resolves to the current origin's `/libs/p5.min.js`.
- The platform uses p5.js 2. Asset loaders return promises, so load assets in an `async function setup()` with `await loadImage(...)`, `await loadFont(...)`, and similar calls; p5.js 1's `preload()` lifecycle is not available.
- `descriptionMd` is rendered with Marked and sanitized with DOMPurify. HTTPS images in the rendered HTML are routed through the authenticated image proxy.
- `isEditable` controls Monaco read-only state and whether a file is saved to GitHub.
- `sampleSolution` enables the destructive “Load Solution” action for `index.ts`.

Adding a YAML file under `exercises/` does **not** publish it automatically. Create or update a matching record through the admin UI (`/exercises`) with its title, raw YAML URL, category, sort order, and optional display window. The Cosmos record's title must match the YAML title: cloud saves look up availability by title, normalize it to a folder name, and commit each editable file separately.

For a quick end-to-end check, run the client and substitute the new raw URL in the `exerciseUrl` query parameter. Exercise specs and assets are expected to remain reachable by URL.

## Runtime behavior

- The client bundles p5's built-in global declarations and TypeScript declaration files into `client/src/p5-dts.ts` and `client/src/ts-dts.ts` for Monaco and the browser compiler.
- Compilation uses the TypeScript compiler API with ESNext output and bundler module resolution. Diagnostics are displayed but do not block iframe creation.
- Generated HTML runs from a blob URL in an unsandboxed iframe. Treat exercise code as trusted: it is not an isolation boundary from the parent application.
- Console calls in the iframe are forwarded to the parent with `postMessage` and shown in the output pane.
- The last compilation is cached by a content hash so an unchanged blob URL keeps browser breakpoints valid. The client uses SHA-256 when Web Crypto is available and falls back to FNV-1a on insecure contexts such as plain-HTTP LAN testing.
- Anonymous users can save the current file to browser `localStorage`. Authenticated users with an assigned repository can save editable files through the server.
- Admins manage users, one-time TANs, GitHub repository assignment/creation, exercises, and exercise visibility windows.

## Build, deployment, and checks

There is no root build, lint configuration, or automated test suite.

```bash
# Client: regenerate declaration bundles, type-check, build Vite assets,
# and copy assets into server/dist/public/p5playground
cd client && npm run build

# Server: compile TypeScript and copy views, static files, p5.js, .env,
# and package manifests into server/dist
cd server && npm run build
```

Production builds expose unauthenticated version checks for deployment verification:

- The server responds to `GET /health` with `{"status":"ok","version":"<server package version>"}`.
- The client build generates `dist/version.json`, served as `GET /playground/version.json`, with `{"version":"<client package version>"}`.

Both `client/` and `server/` have multi-stage Dockerfiles. Pushes to `main` that touch the corresponding directory build and publish `rstropek/ts-web-playground-client:latest` or `rstropek/ts-web-playground-server:latest`; deployment itself is external to this repository.

## Change guide for agents

- UI/editor/loading/compiler behavior: start in `client/src/main.ts`, then `exercise.ts`, `files.ts`, and `compile.ts`.
- Authentication or routing: start in `server/src/main.ts` and `server/src/routes/`; shared integrations are in `server/src/helpers/`.
- Cosmos schemas and queries: `server/src/data/`. Containers use `id` as the item identity and are created without an explicit partition key.
- Exercise content: keep YAML starter code, optional `.ts` solution, and referenced media together under the numbered topic directory.
- p5 or TypeScript dependency upgrades: expect `npm run build` in `client/` to rewrite the large tracked declaration-bundle sources.
- Preserve the distinction between exercise source files and Cosmos metadata; there is no synchronization job between them.
- Do not treat `github/app.ts` as application code; production GitHub writes go through `server/src/helpers/github.ts`.
