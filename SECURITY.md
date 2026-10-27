# Security Policy

## Supported versions

Only the latest version on `main` receives security fixes.

## Reporting a vulnerability

Please do not open a public issue for security problems.

Report it privately through GitHub instead: open the repository's **Security** tab and choose **Report a vulnerability** ([direct link](https://github.com/Haythamasalama/whatsapp-business-monitor/security/advisories/new)).

Include the affected version or commit, steps to reproduce and the impact you expect. You can expect an initial reply within a few days. Accepted reports will be fixed and credited in the advisory, unless you prefer to stay anonymous.

## What this project protects

The app handles Meta access tokens, so these are in scope:

- a token reaching the browser, a log, an API response or the repository;
- calling `/api` without signing in, or from another website with someone's session;
- getting past the sign-in: guessing passwords faster than the limit allows, reusing a session after signing out or changing the password, finishing the setup again;
- the database or its folder readable by other users of the computer (wider than `600` / `700`).

Never include a real token, phone number or customer data in a report. Use `bun run demo` to reproduce a problem with fictional data.
