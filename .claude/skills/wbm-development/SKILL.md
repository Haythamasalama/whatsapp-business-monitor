---
name: wbm-development
description: Use when writing or changing code in WhatsApp Business Monitor (Nuxt 4 + Nitro + node:sqlite), or when shipping it: server API routes and middleware, the SQLite schema and settings, sign-in and sessions, how translations reach the page and the server, demo mode, Nitro auto-import pitfalls, the Docker image, compose file and install script, CI, pull request titles, and releases. Pair with wbm-ui for components and whatsapp-cloud-api for calls to Meta.
---

# Development

One Nuxt 4 app: the page (`app/`, client only, `ssr: false`), the Nitro server (`server/`), and code both
share (`shared/`). The server is the only part that holds tokens and talks to Meta.

## Run it

Node 24 (`.nvmrc`) and Bun.

```bash
bun install
bun run demo        # fictional data on http://127.0.0.1:3211, never calls Meta or writes the database
bun run dev         # real accounts on http://127.0.0.1:3210
bun run typecheck   # vue-tsc; also fails on a translation key missing from either language
bun run build
```

Work in demo mode whenever the change allows it. CI (`.github/workflows/ci.yml`) runs `typecheck` and `build`
on every push and pull request.

## Layout

| Path | Holds |
|---|---|
| `server/api/` | one route per action: accounts, templates, overview, summary, analytics, business (account settings and numbers), settings, setup, auth, version |
| `server/middleware/` | `1.guard`, `2.demo`, `3.auth`, run in that order |
| `server/utils/` | `graph` (Meta), `db`, `accounts`, `settings`, `auth`, `templates`, `overview`, `transfer` (encrypted export), `version`, `demo`, `demo-business`, `business`, `locale`, `handler` |
| `shared/` | `types/meta.ts`, `utils/rules.ts` (template checks and Meta error codes), `utils/i18n.ts`, `locales/{ar,en}.ts` |
| `app/composables/` | `useManager` (state and the API helper), `useSession`, `useConfirm`, `useCopy`, `useStatusAlerts`, `usePhoneAction` and `useTemplateAction` (confirm, write, toast) |
| `app/utils/` | `labels`, `format`, `locale`, `templateCode` (copy and paste text), `drafts` |

## A server route

```ts
// server/api/templates.post.ts
export default apiHandler(async (event) => {
  const account = requireAccount(event)   // ?account=<id>; 400 when its token or WABA id is missing
  const body = await readBody<Record<string, unknown>>(event)
  const problems = templateProblems(readTemplateText(body))

  if (problems.length) {
    throw apiError(422, problems.join('\n'))
  }

  return orFail(await graph(account, 'POST', `${account.waba}/message_templates`, {}, { /* ... */ }))
})
```

- Wrap every route in `apiHandler`: it runs the handler in the request's language and turns an unexpected
  exception into a translated 500 with the real message, logging the stack.
- Errors are `apiError(status, t('…'))`. Validation is 422 with one problem per line.
- `graph()` never throws; it returns `{ error }`. `orFail()` turns that into a 502 that carries Meta's error,
  and the page shows it through `errorText()`. `graphFields()` takes several field lists and moves to the next
  one while Meta answers code 100 (a field this account or API version does not have).
- Return only what the page needs. A token never goes into a response, a log line or an error message.

## Middleware and the page's requests

1. `1.guard` refuses any `/api/` request without `X-Requested-With: whatsapp-manager`. Another site can't add
   that header without a CORS preflight, and the server answers none.
2. `2.demo` answers every `/api/` call from `server/utils/demo.ts` when `WHATSAPP_TEMPLATES_DEMO=true`.
3. `3.auth` needs a session for everything except `OPEN`: `/api/app`, `/api/setup`, `/api/auth/login`,
   `/api/auth/logout`. Adding a route to `OPEN` is a security decision; say why in the pull request.

The page calls the API only through `useManager().api(path, { method, body, scoped })`. It adds both headers,
adds `?account=` for the open account unless `scoped: false`, signs the page out on a 401, and throws an
`Error` with a readable message. Don't call `$fetch('/api/…')` from a component.

**Every new route needs a demo answer** in `server/middleware/2.demo.ts`. Anything that would write or call
Meta in a way the demo can't fake throws `apiError(422, t('server.notInDemo'))`.

## Database

`server/utils/db.ts` opens `whatsapp-manager.db` with `node:sqlite` in WAL mode, inside the data folder
(`WHATSAPP_TEMPLATES_DIR`, default `~/.config/whatsapp-templates`). The folder is made `700` and the file
`600`, since tokens are stored in it.

- Schema changes are a **new string appended to `MIGRATIONS`**. `PRAGMA user_version` records how many have
  run, and each runs in a transaction. Never edit or reorder a step that has shipped.
- Tables: `accounts`, `settings` (key/value), `users`, `sessions`.
- Read and write through the helpers, not raw SQL in routes: `findAccount` / `loadAccount` / `saveAccount` /
  `deleteAccount`, `readSettings` / `writeSettings` / `readSettingsInput`, `currentUser` / `requireUser`.
- `AccountSummary`, which the page receives, has no token.

## Sign-in

- Passwords are hashed with scrypt (`hashPassword`, `verifyPassword`); at least 8 characters.
- A session is a random token in the `wmm_session` cookie (httpOnly, SameSite Lax, Secure on HTTPS). Only its
  sha256 hash is stored; it lasts 30 days.
- `limitLogin()` allows 10 failed sign-ins per 15 minutes per address, kept in memory.
- With no user yet the page shows `SetupPage`; `/api/setup` creates the first user and the settings, and answers
  409 once a user exists.

## Translations

`t()`, `tOr()` and `translate()` live in `shared/utils/i18n.ts` and work on both sides. The page's language
comes from `locale` (`app/utils/locale.ts`); the server's from the request's `X-Locale` header, held for the
request by `withLocale()` (AsyncLocalStorage).

## Nitro pitfalls

These broke the build or the running server before:

- **`shared/` must not import runtime values from a relative path.** Nitro resolves them differently from Vite.
  That is why `i18n.ts` imports the dictionaries as types only, and `setupI18n()` is called from
  `app/plugins/locale.ts` and from `server/utils/locale.ts`. A new shared helper that needs data takes it as a
  parameter.
- **No `Identifier as Type` on an auto-imported value in server code.** Nitro's auto-import doesn't see a
  value written as `(CATEGORIES as readonly string[])`, so the import is never added and the route fails with
  "CATEGORIES is not defined". Write `CATEGORIES.some(value => value === category)`.
- **Never name a variable `t`.** It hides the auto-imported `t()`. Use `entry`, `template`, `item`.
- `process.umask()` is not available in Nitro's dev workers; set modes with `chmodSync`.
- A new folder under `server/` (for example `server/plugins/`) needs a dev server restart to be picked up.

## Privacy promise

The app sends nothing anywhere except Meta's Graph API (`graph.facebook.com`) and, once a day, GitHub's
latest-release endpoint (`server/utils/version.ts`, off with `WHATSAPP_TEMPLATES_UPDATE_CHECK=false`). No
analytics, no fonts or scripts from a CDN, no error reporting service. Keep it that way.

## Docker and install

- `Dockerfile`: builds with Bun on `node:24-slim`, runs on `node:24-alpine` as the `node` user, data in
  `/data/accounts`, with a healthcheck.
- `compose.yaml`: the app published on `127.0.0.1` by default, plus a `nickfedor/watchtower` updater that only
  touches containers labelled `com.centurylinklabs.watchtower.enable`, checking every 6 hours. Its HTTP API
  (`/v1/update`, not published, `WHATSAPP_MANAGER_UPDATE_TOKEN` from `.env`) backs the page's "Update now":
  `POST /api/version/update` → `startUpdate()` in `server/utils/version.ts`; the page waits for the new version
  and reloads (`useAppUpdate`). install.sh creates the token and makes `.env` `600`.
- `install.sh`: one command for a first install or an update. `--server` publishes on `0.0.0.0`. It writes `.env`
  next to the compose file with `WHATSAPP_MANAGER_BIND`, `PORT`, `DATA`, `UID`, `GID` and optionally `VERSION`,
  keeps any value already there, and creates the data folder owned by the user that runs the container.
- `WHATSAPP_MANAGER_DATA_SHOWN` and `WHATSAPP_MANAGER_HOST_HOME` let the settings page show the database's path
  on the host instead of the path inside the container.

## Shipping

- Branch from `main` (or a fresh `git worktree` from `origin/main`); one change per pull request.
- Pull request titles follow Conventional Commits with the types and scopes in
  `.github/workflows/pr-title.yml`: `feat(analytics): show button clicks per template`. Scopes are
  `dashboard`, `templates`, `analytics`, `accounts`, `server`, `docker`, `demo`, `docs`. The summary starts with a
  lowercase verb and has no full stop. Pull requests are squash-merged, so the title becomes the commit.
- UI changes include screenshots from `bun run demo`, light and dark.
- **Release:** bump `version` in `package.json` in its own pull request (`chore: release 0.4.0`), merge it, then
  tag that commit on `main` and push the tag:

  ```bash
  git remote get-url origin   # must be the whatsapp-business-monitor repository
  git fetch origin && git tag -a v0.4.0 origin/main -m "v0.4.0" && git push origin v0.4.0
  ```

  `.github/workflows/docker.yml` then publishes `ghcr.io/haythamasalama/whatsapp-business-monitor` as
  `0.4.0`, `0.4` and `latest` for amd64 and arm64, and creates the GitHub release with generated notes.

## Before you push

- [ ] `bun run typecheck` and `bun run build` pass.
- [ ] A new route has a demo answer and, if it changes data, a 422 in demo mode.
- [ ] Nothing private in the diff or the screenshots:
  `git diff origin/main | grep -nE "EAA[A-Za-z0-9]{20,}|/Users/|/home/"` is empty, and no real phone number,
  WABA id or customer name appears.
