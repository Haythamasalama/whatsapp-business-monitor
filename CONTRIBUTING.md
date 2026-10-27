# Contributing to WhatsApp Manager Monitoring

Thank you for helping improve the project. This guide shows how to set it up, how the code is organized, and what we expect in a pull request.

## Ways to help

- **Report a bug.** Open an [issue](https://github.com/Haythamasalama/whatsapp-manager-monitoring/issues/new/choose) with the steps to reproduce it and a screenshot if you can. Remove tokens, phone numbers and customer data first.
- **Suggest a feature.** Describe the problem first, then the solution you have in mind.
- **Translate.** The interface is in Arabic and English. Another language is very welcome; open an issue first so we can agree on the approach.
- **Write code.** Pick an issue labelled `good first issue` or `help wanted`, and leave a comment so others know you're working on it.

## Set up

Requirements: Node.js 22.21+ or 24.11+ (see `.nvmrc`) and [Bun](https://bun.sh).

```bash
git clone https://github.com/<you>/whatsapp-manager-monitoring.git
cd whatsapp-manager-monitoring
bun install
bun run demo        # fictional data on http://127.0.0.1:3211, no Meta account needed
bun run dev         # your real accounts on http://127.0.0.1:3210
bun run typecheck
```

Work with `bun run demo` whenever you can: it never calls Meta, never asks to sign in and never writes to the database.

## How the code is organized

- **`server/api/`** holds one Nitro route per action: accounts, templates, overview (spend), analytics. Every Graph API call goes through `server/utils/graph.ts`.
- **`server/middleware/1.guard.ts`** refuses requests without the `X-Requested-With` header. **`2.demo.ts`** answers every `/api` call with the fixtures in `server/utils/demo.ts` when demo mode is on. **`3.auth.ts`** requires a session for everything but setup and sign-in.
- **`server/utils/db.ts`** opens the SQLite database (`node:sqlite`) and runs its migrations; add a new entry to `MIGRATIONS` for every schema change. **`accounts.ts`**, **`settings.ts`** and **`auth.ts`** read and write it. Tokens never leave the server.
- **`shared/`** is used by both sides: types for Meta's payloads, the template rules (`templateProblems()`), so the page and the server check a template the same way, and the translations: `t()` in `shared/utils/i18n.ts` with the dictionaries in `shared/locales/`.
- **`app/composables/useManager.ts`** holds the page state and the API helper. Components read from it.
- **`app/components/`** is the interface, built with [Nuxt UI](https://ui.nuxt.com) components.
- **`.claude/skills/`** holds [Claude Code](https://claude.com/claude-code) skills for the theme, the UI, development and the WhatsApp API. They are plain Markdown, so they also work as a short guide to the project's rules.

## Code style

- Follow the style of the surrounding code: TypeScript, two-space indentation, no semicolons, small components with clear names.
- Use Nuxt UI components and its colour tokens (`text-muted`, `bg-elevated`, `primary`…) rather than raw colours.
- The page runs right to left in Arabic and left to right in English. Use logical classes (`ms-*`, `pe-*`, `start-*`, `text-start`), and wrap phone numbers, IDs and other left-to-right values in `<bdi dir="ltr">`.
- Every user-visible string goes through `t('key')`, with the text in both `shared/locales/ar.ts` (Modern Standard Arabic) and `shared/locales/en.ts`; `bun run typecheck` fails when a key is missing from either. The server answers in the language of the page's `X-Locale` header. Translate Meta's error codes in `shared/utils/rules.ts` rather than showing raw English.
- Respect the privacy promise: no analytics, no token in any response, and no outside calls except Meta's Graph API and the once-a-day release check on GitHub (`server/utils/version.ts`).

## Pull requests

1. Fork the repository and create a branch from `main`, for example `fix/template-preview` or `feat/export-csv`.
2. Keep each pull request focused on one change.
3. Run `bun run typecheck` and `bun run build` before pushing.
4. For UI changes, attach before and after screenshots taken with `bun run demo`, in light and dark mode if the change affects colours. Never attach a screenshot of a real account.
5. Give the pull request a title in the format below. We squash-merge, so the title becomes the commit on `main`.

### Pull request titles

Titles follow [Conventional Commits](https://www.conventionalcommits.org): `type(scope): summary`.

```
feat(analytics): show button clicks per template
fix(templates): keep media headers when editing
docs: explain where the database lives
```

Types: `feat`, `fix`, `perf`, `refactor`, `i18n`, `docs`, `test`, `build`, `ci`, `chore`. Scopes are optional: `dashboard`, `templates`, `analytics`, `accounts`, `server`, `docker`, `demo`, `docs`.

## Releases

1. Bump `version` in `package.json` and merge it to `main`.
2. Tag the merge commit and push the tag: `git tag v0.2.0 && git push origin v0.2.0`.
3. The **Docker image** workflow publishes `ghcr.io/haythamasalama/whatsapp-manager-monitoring` as `0.2.0`, `0.2` and `latest`. Users update with `docker compose pull && docker compose up -d`.

## Code of Conduct

By taking part, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
