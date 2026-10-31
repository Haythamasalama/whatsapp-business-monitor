<div align="center">

<img src="public/logo.svg" width="80" height="80" alt="WhatsApp Business Monitor logo">

# WhatsApp Business Monitor

**Your WhatsApp Business accounts on one screen: templates, costs, numbers and settings.**<br>
Free and open source. It runs on your computer or your server, and your tokens never leave it.

[![CI](https://github.com/Haythamasalama/whatsapp-business-monitor/actions/workflows/ci.yml/badge.svg)](https://github.com/Haythamasalama/whatsapp-business-monitor/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-0F0F12.svg)](LICENSE)
[![Docker image](https://img.shields.io/badge/docker-ghcr.io-317455?logo=docker&logoColor=white)](https://github.com/Haythamasalama/whatsapp-business-monitor/pkgs/container/whatsapp-business-monitor)

[🌐 Website](https://wbm.haythamasalama.me/) · [العربية](https://wbm.haythamasalama.me/ar/) · [🚀 Install](#-install) · [📖 Docs](https://wbm.haythamasalama.me/docs/accounts-and-numbers/) · [🤝 Contribute](CONTRIBUTING.md)

<img src="docs/screenshots/overview.png" width="860" alt="The overview of two accounts of a fictional store: this month's cost, messages sent, templates that need attention, a daily cost chart and the cost per account.">

</div>

## ✨ What it does

- 🏠 **Every account at a glance:** this month's cost and messages, what needs your attention now (a rejected or paused template, a number with low quality) and the most-sent templates.
- 📝 **Templates:** status and 30-day sends, deliveries and reads for each one. Create and edit with a live WhatsApp preview or paste them as text, and delete, archive, unpause or copy several at once. [Guide](https://wbm.haythamasalama.me/docs/templates/)
- 📊 **Reports and costs:** what Meta charged by category, country and number, every message sent and received, the 1,000 free service messages left this month, and which of two templates customers block less. [Guide](https://wbm.haythamasalama.me/docs/reports-and-costs/)
- ⚙️ **Account and numbers:** whether each number can send and why not, verification, payment, people with access, the activity log, and each number's profile, name, badge, username, QR codes and blocked list. [Guide](https://wbm.haythamasalama.me/docs/accounts-and-numbers/)
- 👥 **Several accounts:** found from one token, and moved to another computer in one encrypted file.
- 🔐 **Private:** runs where you choose, behind your own sign-in, in Arabic or English, light or dark.

| An account | Reports |
|:--:|:--:|
| <img src="docs/screenshots/dashboard.png" alt="An account's home: cost, messages, balance, daily cost, cost by type, what needs attention and the most-sent templates."> | <img src="docs/screenshots/reports-costs.png" alt="Reports: what was charged, free messages, free replies left, cost over time, and cost by category and country."> |
| **Templates** | **Account settings** |
| <img src="docs/screenshots/templates-actions.png" alt="The templates tab with two selected and the archive, unarchive, copy and delete buttons."> | <img src="docs/screenshots/account-settings.png" alt="Account settings: sending health with reasons, account details, numbers, people with access and the activity log."> |

Every screenshot shows a fictional store. More on the [website](https://wbm.haythamasalama.me/#screenshots).

## 🚀 Install

You need [Docker](https://docs.docker.com/get-docker/). Run one command:

```bash
curl -fsSL https://raw.githubusercontent.com/Haythamasalama/whatsapp-business-monitor/main/install.sh | sh
```

Open the address it prints, create your admin account, then add a WhatsApp account with a Meta system user token that has `whatsapp_business_management`.

- **On a server:** add `--server` so other computers can open it: `… | sh -s -- --server`
- **Updates install themselves** every 6 hours, with the same settings and data. To update right away, press **Update now** at the bottom of the app or in Settings. Installs made before v0.7.0 get the button after running the install command once more.
- **Your data** stays in `~/whatsapp-business-monitor`: the settings in `.env`, the database in `data/`.

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
- A new install opened from another computer, through Docker or behind a proxy asks for the **setup code** printed in its log (`docker compose logs`; `install.sh` shows it too), so nobody else can claim it first.
- Ten sign-in tries per address in 15 minutes. Behind your own reverse proxy, set `WHATSAPP_MANAGER_TRUST_PROXY=true` in `.env` so the real visitor's address is counted.
- The app only answers to `localhost`, an IP address, its saved public address, or names in `WHATSAPP_MANAGER_ALLOWED_HOSTS` (comma separated). This stops other sites from reaching it through DNS rebinding.
- Exporting the accounts asks for your sign-in password. Pages can't be framed by other sites.
- No response ever contains an access token. Account exports are encrypted with a passphrase you choose.
- The database folder is private (`700`), the database file `600`.
- Besides Meta, the app only asks GitHub once an hour (or when you press **Check now**) whether a new version is out. You can turn that off in **Settings**.
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
