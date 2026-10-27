<div align="center">

<img src="public/logo.svg" width="88" height="88" alt="WhatsApp Manager Monitoring logo">

# WhatsApp Manager Monitoring

**Your WhatsApp templates, how they perform and what they cost, on one screen.**<br>
A free, open-source dashboard for the WhatsApp Business Platform. It runs on your machine; your tokens never leave it.

[![CI](https://github.com/Haythamasalama/whatsapp-manager-monitoring/actions/workflows/ci.yml/badge.svg)](https://github.com/Haythamasalama/whatsapp-manager-monitoring/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-0F0F12.svg)](LICENSE)
![Nuxt 4](https://img.shields.io/badge/Nuxt-4-317455?logo=nuxt&logoColor=white)
![Node 22.21+ or 24.11+](https://img.shields.io/badge/node-22.21%2B%20%7C%2024.11%2B-317455?logo=node.js&logoColor=white)

[Features](#-features) · [Docker](#-run-with-docker) · [From source](#-run-from-source) · [Contribute](CONTRIBUTING.md)

<img src="docs/screenshots/overview.png" width="860" alt="The overview of two accounts of a fictional store: this month's cost, messages sent, templates that need attention, a daily cost chart, the cost per account and a table of accounts.">

</div>

## ✨ Features

- 📊 **All accounts in one place.** Cost, messages and templates for every account.
- 📝 **Every template's numbers.** Status, sends, deliveries and reads. Table, list or cards.
- 💰 **What you spend.** This month's cost per day and per message type.
- ✏️ **Create and edit.** Fill in the fields or paste the full template, with a live WhatsApp preview.
- 📋 **Copy and paste.** Copy any template, change it, paste it back. New ones are created, changed ones updated.
- 🔔 **Live status.** A notification when a template is approved, rejected or paused.
- 📱 **Number health.** Status, quality and daily limit of every number.
- 📦 **Move your accounts.** Export them all to one file encrypted with your passphrase, and import it on another computer.
- 🌍 **Arabic or English.** Light or dark, and templates in any language.
- 🔒 **Private.** Runs on your machine. Your tokens never leave it.

<details>
<summary>The copy and paste format</summary>

```
Name: order_confirmation
Category: Utility
----------------
Language: en
Your order {{1}} is confirmed.

{{1}} = 10482
```

</details>

## 📸 Screenshots

| Account | Template |
|:--:|:--:|
| <img src="docs/screenshots/dashboard.png" alt="An account: cost, messages, balance, number, daily cost, cost by type, number health and the templates table."> | <img src="docs/screenshots/template-preview.png" alt="A template's preview, details and 30-day numbers."> |
| **Editing** | **Pasted content** |
| <img src="docs/screenshots/template-edit.png" alt="Editing a template with fields, sample values and a live preview."> | <img src="docs/screenshots/create-from-text.png" alt="Two pasted templates: one update and one new template."> |
| **Card view** | **Dark mode** |
| <img src="docs/screenshots/views-cards.png" alt="Templates as cards with a message preview each."> | <img src="docs/screenshots/dashboard-dark.png" alt="The overview in dark mode."> |
| **Arabic, right to left** | |
| <img src="docs/screenshots/arabic.png" alt="The overview in Arabic."> | |

The screenshots show a fictional store.

## 🐳 Run with Docker

One command, no Node.js needed:

```bash
curl -fsSLO https://raw.githubusercontent.com/Haythamasalama/whatsapp-manager-monitoring/main/compose.yaml && docker compose up -d
```

Open <http://127.0.0.1:3210>, choose **Add account** and paste a Meta system user token with `whatsapp_business_management`. The app finds the business accounts and numbers it can reach.

**Update to a new version** (from the same folder):

```bash
docker compose pull && docker compose up -d
```

Your accounts stay in `~/.config/whatsapp-templates`. When a new version is out, the page footer says so. Open the app at `127.0.0.1` or `localhost`; another computer's name or address is refused.

## 💻 Run from source

You need Node.js 22.21+ or 24.11+ and [Bun](https://bun.sh) or npm.

```bash
git clone https://github.com/Haythamasalama/whatsapp-manager-monitoring.git
cd whatsapp-manager-monitoring
bun install
bun run dev
```

Then open <http://127.0.0.1:3210>. To update: `git pull && bun install`.

## 🔐 Accounts and security

- Each account is one file in `~/.config/whatsapp-templates/` (or `WHATSAPP_TEMPLATES_DIR`), written with `600` permissions.
- The server listens on `127.0.0.1` only. No response contains a token, and `/api` refuses other hosts and requests without its `X-Requested-With` header.
- Besides Meta, the server only asks GitHub once a day whether a new version is out. Set `WHATSAPP_TEMPLATES_UPDATE_CHECK=false` to turn that off.
- There is no login, so don't deploy it to a public server. Found a vulnerability? See the [security policy](SECURITY.md).

## ⚠️ Limits from Meta

- There is no balance API for accounts paid by card.
- Template analytics must be turned on once per account (the app has a button), and can't be turned off.
- Reads and clicks are counted for 7 days after sending.
- An approved template can be edited once every 24 hours, up to 10 times in 30 days.

## 📄 License

[MIT](LICENSE) · Made by [Haytham A. Salama](https://haythamasalama.me) · Built with [Nuxt](https://nuxt.com) and [Nuxt UI](https://ui.nuxt.com).

WhatsApp is a trademark of Meta Platforms, Inc. This project is not affiliated with or endorsed by Meta.
