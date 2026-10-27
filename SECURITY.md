# Security Policy

## Supported versions

Only the latest version on `main` receives security fixes.

## Reporting a vulnerability

Please do not open a public issue for security problems.

Report it privately through GitHub instead: open the repository's **Security** tab and choose **Report a vulnerability** ([direct link](https://github.com/Haythamasalama/whatsapp-manager-monitoring/security/advisories/new)).

Include the affected version or commit, steps to reproduce and the impact you expect. You can expect an initial reply within a few days. Accepted reports will be fixed and credited in the advisory, unless you prefer to stay anonymous.

## What this project protects

The app handles Meta access tokens, so these are in scope:

- a token reaching the browser, a log, an API response or the repository;
- another website, or another device on the network, calling the local `/api`;
- account files written with permissions wider than `600`, or outside the accounts folder.

Never include a real token, phone number or customer data in a report. Use `bun run demo` to reproduce a problem with fictional data.
