---
name: wbm-theme
description: Use when changing colours, fonts, radius, borders, shadows, dark mode or chart colours in WhatsApp Business Monitor (app/app.config.ts, app/assets/css/main.css, the fonts block of nuxt.config.ts), or when a component reaches for a raw colour. Covers the sage primary palette, the Nuxt UI tokens the project overrides in light and dark, the chart tokens, the fonts, and the classes to use instead of hex values or Tailwind palette names.
---

# Theme

The look is quiet and flat: a light grey page, white cards with a thin border and no shadow, one green
(sage) for actions and charts. Everything comes from three files; components only use tokens.

| File | Holds |
|---|---|
| `app/app.config.ts` | Nuxt UI colours (`primary: 'sage'`, `neutral: 'neutral'`) and flat cards (`card.slots.root: 'shadow-none'`) |
| `app/assets/css/main.css` | the sage palette, the fonts, the overridden `--ui-*` tokens, the chart tokens, the RTL icon flips |
| `nuxt.config.ts` → `fonts` | which font families and weights `@nuxt/fonts` downloads |

## Palette

`sage` is declared in `@theme static` as `--color-sage-50` … `--color-sage-950`:

| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#f1f8f4` | `#ddefe5` | `#bddfcc` | `#91c8aa` | `#62ab85` | `#418f69` | `#317455` | `#295d46` | `#234b3a` | `#1e3e31` | `#0f231b` |

Neutral is Nuxt UI's own `neutral` scale.

## Tokens the project overrides

| Token | Light (`:root`) | Dark (`.dark`) |
|---|---|---|
| `--ui-primary` | sage 600 | sage 400 |
| `--ui-radius` | `.375rem` | same |
| `--ui-border` | `#ececec` | neutral 800 |
| `--ui-bg-muted` (also the page background) | `#f8f8f7` | `#121212` |
| `--chart-bar` | `#2f9468` | `#46a77a` |
| `--chart-track` | `#e6f2eb` | `#1c2a23` |

Every other `--ui-*` token is Nuxt UI's default. A new token gets a value in **both** `:root` and `.dark`.

## Rules for components

- Colours come from Nuxt UI classes only: text `text-default`, `text-toned`, `text-muted`, `text-dimmed`,
  `text-highlighted`; surfaces `bg-default`, `bg-muted`, `bg-elevated`, `bg-accented`; borders
  `border-default`, `border-muted`. Components take `color="primary | neutral | success | warning | error | info"`.
  Never a hex value, `text-green-600`, or `bg-sage-500` in a component.
- Status colours mean status. `Tone` in `app/utils/labels.ts` maps Meta's statuses and quality ratings to
  `success`, `warning`, `error`, `neutral`; don't reuse those colours for decoration.
- Cards are flat: `rounded-xl border border-default bg-default`, no shadow. Only a card that opens something on
  click gets `hover:shadow-md` (see `TemplateCards.vue`). Icon tiles inside a card are
  `rounded-lg border border-default bg-muted text-toned`.
- Charts use the chart tokens through Tailwind's variable syntax: `bg-(--chart-bar)` on `bg-(--chart-track)`,
  bars with rounded tops (`rounded-t-[4px]`). A chart has one series and one hue. Before adding a second series,
  give it its own token in both modes and check its contrast against `--ui-bg` in each; never borrow a status
  colour for it.

## Fonts

- `IBM Plex Sans Arabic` is the `--font-sans` for both Arabic and Latin text, weights 400 to 700.
- `IBM Plex Mono` is `--font-mono`, used through `font-mono` for IDs, template names in code views and the
  template editor.
- A new weight or family must be added to `fonts.families` in `nuxt.config.ts` too, or it falls back to the
  system font. The fonts are bundled at build time, so the app needs no outside request for them.

## Dark mode

Nuxt UI's colour mode adds `.dark` to `<html>`. Check every visual change in both modes with `bun run demo`
(fictional data on `http://127.0.0.1:3211`), and take screenshots for a pull request from demo mode only.

## Checklist

- [ ] No raw colour in `app/components/**`: `grep -rnE "#[0-9a-fA-F]{3,6}\b|(text|bg|border)-(red|green|blue|gray|sage)-[0-9]" app/components`
- [ ] Any new token has a light and a dark value.
- [ ] Looked at the change in light and dark, Arabic and English.
