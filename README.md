<div align="center">

<img src="public/logo.svg" width="80" height="80" alt="WhatsApp Business Monitor logo">

# WhatsApp Business Monitor

**See your WhatsApp templates, how they perform and what they cost, on one screen.**<br>
Free and open source. It runs on your computer or your server, and your tokens never leave it.

[![CI](https://github.com/Haythamasalama/whatsapp-business-monitor/actions/workflows/ci.yml/badge.svg)](https://github.com/Haythamasalama/whatsapp-business-monitor/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-0F0F12.svg)](LICENSE)
[![Docker image](https://img.shields.io/badge/docker-ghcr.io-317455?logo=docker&logoColor=white)](https://github.com/Haythamasalama/whatsapp-business-monitor/pkgs/container/whatsapp-business-monitor)

[🌐 Website](https://haythamasalama.github.io/whatsapp-business-monitor/) · [العربية](https://haythamasalama.github.io/whatsapp-business-monitor/ar/) · [🚀 Install](#-install) · [📸 Screenshots](#-screenshots) · [🤝 Contribute](CONTRIBUTING.md)

<img src="docs/screenshots/overview.png" width="860" alt="The overview of two accounts of a fictional store: this month's cost, messages sent, templates that need attention, a daily cost chart and the cost per account.">

</div>

## ✨ What it does

- 📊 **Every account on one screen:** this month's cost, messages and templates.
- 📝 **Every template's numbers:** status, sends, deliveries and reads for the last 30 days.
- ✏️ **Create and edit templates** with a live WhatsApp preview, or paste a full template as text.
- 🔍 **Find templates fast:** search, filter and sort, as a table, a list with a preview, or cards.
- 🔔 **Alerts** when a template is approved, rejected or paused, with Meta's reason in plain words.
- 📱 **Number health:** status, quality rating and daily limit.
- 👥 **Several accounts:** find them from a token, and move them all to another computer in one encrypted file.
- 🌍 **Arabic or English,** light or dark.

## 📸 Screenshots

| An account | A template |
|:--:|:--:|
| <img src="docs/screenshots/dashboard.png" alt="An account: cost, messages, number, daily cost, cost by type, number health and the templates table."> | <img src="docs/screenshots/template-preview.png" alt="A template's preview, details and 30-day numbers."> |
| **List and preview** | **Paste templates as text** |
| <img src="docs/screenshots/views-split.png" alt="The templates as a list, with the selected one's preview and numbers beside it."> | <img src="docs/screenshots/create-from-text.png" alt="Two pasted templates: one update and one new template."> |
| **Accounts** | **Settings** |
| <img src="docs/screenshots/accounts.png" alt="The accounts page with import, export and add buttons."> | <img src="docs/screenshots/settings.png" alt="The settings: app name and address, updates, password and backup."> |
| **Dark mode** | **Arabic, right to left** |
| <img src="docs/screenshots/dashboard-dark.png" alt="The overview in dark mode."> | <img src="docs/screenshots/arabic.png" alt="The overview in Arabic."> |

The screenshots show a fictional store. More on the [website](https://haythamasalama.github.io/whatsapp-business-monitor/#screenshots).

## 🚀 Install

You need [Docker](https://docs.docker.com/get-docker/). Run one command:

```bash
curl -fsSL https://raw.githubusercontent.com/Haythamasalama/whatsapp-business-monitor/main/install.sh | sh
```

Open the address it prints, create your admin account, then add a WhatsApp account with a Meta system user token that has `whatsapp_business_management`.

- **On a server:** add `--server` so other computers can open it: `… | sh -s -- --server`
- **Updates install themselves** every 6 hours, with the same settings and data. To update right away, run the command again.
- **Your data** stays in `~/whatsapp-business-monitor`: the settings in `.env`, the database in `data/`.
- **Installed it as WhatsApp Manager Monitoring?** That was its old name. Run the command again: it keeps your `~/whatsapp-manager` folder, settings and data, and the old image keeps getting updates too.

<details>
<summary>🌐 HTTPS on a server</summary>

Put it behind a reverse proxy (Caddy, nginx, Traefik…) that forwards to port `3210`, and set the same address in **Settings**. With Caddy:

```
wa.example.com {
  reverse_proxy 127.0.0.1:3210
}
```

</details>

<details>
<summary>📌 Stay on one version</summary>

Add `WHATSAPP_MANAGER_VERSION=0.3.0` to `.env` in that folder and run the install command again. Remove the line to follow new releases again.

</details>

<details>
<summary>💻 Run from source</summary>

You need Node.js 22.21+ or 24.11+ and [Bun](https://bun.sh).

```bash
git clone https://github.com/Haythamasalama/whatsapp-business-monitor.git
cd whatsapp-business-monitor
bun install
bun run dev    # http://127.0.0.1:3210
bun run demo   # fictional data, no Meta account needed
```

The database is in `~/.config/whatsapp-templates` (or `WHATSAPP_TEMPLATES_DIR`).

</details>

<details>
<summary>🔐 Security</summary>

- Everything but the setup and sign-in pages needs a sign-in. Passwords are hashed with scrypt; sessions live in an `httpOnly` cookie.
- No response ever contains an access token. Account exports are encrypted with a passphrase you choose.
- The database folder is private (`700`), the database file `600`.
- Besides Meta, the app only asks GitHub once a day whether a new version is out. You can turn that off in **Settings**.
- Found a vulnerability? See the [security policy](SECURITY.md).

</details>

<details>
<summary>⚠️ Limits from Meta</summary>

- Accounts paid by card have no balance API.
- Template analytics must be turned on once per account, and can't be turned off again.
- Reads and clicks are counted for 7 days after sending.
- An approved template can be edited once every 24 hours, up to 10 times in 30 days.

</details>

## 📄 License

[MIT](LICENSE) · Made by [Haytham A. Salama](https://haythamasalama.me) · Built with [Nuxt](https://nuxt.com) and [Nuxt UI](https://ui.nuxt.com)

WhatsApp is a trademark of Meta Platforms, Inc. This project is not affiliated with or endorsed by Meta.
