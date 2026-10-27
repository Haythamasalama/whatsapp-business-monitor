---
name: wbm-ui
description: Use when building or changing a screen or component in WhatsApp Business Monitor (app/components, app/composables, app/utils): page layout, cards, stat tiles, forms and field hints, tables, modals and confirmations, toasts, copy buttons, loading states, the template views, interface text, translations, and right-to-left (Arabic) versus left-to-right (English) layout. Pair with wbm-theme for colours and fonts.
---

# UI

The interface is Nuxt UI 4 on Tailwind 4, in Arabic (right to left) and English (left to right). Pages are
short, calm and dense with information; text is short and every hint hides behind an «i» icon.

## Screens

`ManagerPage.vue` holds the whole signed-in app; `useManager().screen` picks what it shows:

| `screen` | Component | Shows |
|---|---|---|
| `overview` | `OverviewPage` | every account together: month spend and messages, templates, what needs attention, spend by day and by account |
| `account` | `StatsCards` + `TemplatesPanel` | one account: its spend, phone numbers (`PhonesHealth`) and templates ; the Reports tab is `ReportsPanel` (`ReportBars` for charts over time, `CostShares` for shares, `ReportCompare`) |
| `accounts` | `AccountsPage` | the account table: add, edit, open, delete, export, import |
| `settings` | `SettingsPage` | general, updates, security, backup |

The sidebar (`AccountsSidebar`) only switches accounts; managing them lives on the `accounts` screen. On small
screens one `USelect` replaces the sidebar, with the sentinels `*` (overview), `+` (accounts) and `#`
(settings) next to the account ids. Before sign-in, `SetupPage` and `LoginPage` render inside `AuthLayout`.

## Building blocks

- **Section card:** `<section class="space-y-4 rounded-xl border border-default bg-default p-5">` with an
  `h2.font-semibold.text-highlighted` title. A table card drops the padding and lets the table fill it.
- **Stat:** `<StatTile :title :icon :hint :loading>` with the value in the default slot. It draws its own
  skeleton while `loading`.
- **Field hint:** never a line of help text under a field. Put the label and the hint in the `#label` slot:

  ```vue
  <UFormField>
    <template #label>
      <FieldLabel :label="t('settings.name')" :hint="t('hints.name')" />
    </template>
    <UInput v-model="general.instance_name" class="w-full" />
  </UFormField>
  ```

- **Confirm:** `const confirm = useConfirm()`, then `if (await confirm({ title, confirmLabel, danger: true }))`.
  `danger` makes the button red with a trash icon; use it for deletes and anything that cannot be undone.
  Skip `description` unless the title alone would mislead.
- **Toast:** `useToast().add({ title, color: 'success', icon: 'i-lucide-check' })`; errors use `color: 'error'`
  with the server's message as `description`. The toaster sits at the bottom centre (`app.vue`).
- **Copy:** `const copy = useCopy()` then `copy(text)`; it shows the copied or failed toast itself.
- **Loading:** `USkeleton` blocks shaped like the content, never a spinner over the page.
- **Templates:** `TemplatesPanel` shows the same groups as a table, a split list with a preview
  (`TemplateSplit`), or cards (`TemplateCards`). The choice is kept in `localStorage` under
  `whatsapp-templates:view`. Editing has two tabs from `editTabs()`: fields and full content.
- **Message preview:** `WhatsAppPreview` escapes the text before it adds formatting, which is why it may use
  `v-html`. Nothing else uses `v-html`.
- **Icons:** Lucide only (`i-lucide-*`); `icon.serverBundle: 'local'` bundles them, so they work offline.
  An icon-only button gets an `aria-label` (and a `UTooltip` when the icon is not obvious).

## Text

- Arabic is Modern Standard Arabic, short and plain. English says the same thing, not a word-for-word copy.
- Every visible string goes through `t('key')`, with the key in **both** `shared/locales/ar.ts` and
  `shared/locales/en.ts`; `bun run typecheck` fails when either side misses it.
- Values: `{name}` in the string, `t('key', { name })`. Counts that change the wording are functions:
  `` accountCount: ({ n }: Params) => (Number(n) === 1 ? 'حساب واحد' : Number(n) === 2 ? 'حسابان' : `${n} حسابات`) ``.
- Keys built from Meta's data use `` tOr(`status.${status}`, status) ``, which falls back to Meta's own code. Use
  the helpers in `app/utils/labels.ts` (`statusOf`, `categoryLabel`, `qualityOf`, `phoneStatusOf`,
  `nameStatusOf`, `messagingLimit`, `languageName`) rather than reading the dictionaries again.
- Language codes show as `EN`, `AR`, `PT-BR` through `languageCode()`. Template names, IDs and codes stay as
  Meta wrote them.
- No raw Meta error text: `errorText()` in `shared/utils/rules.ts` turns the codes it knows into a sentence.

## Right to left

- `<html dir>` follows the language (`isRtl` in `app/utils/locale.ts`). Write the layout once with logical
  classes: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `border-s`, `rounded-e-*`. No `ml-*`,
  `mr-*`, `left-*`, `right-*` or `text-left` for anything that should flip.
- Phone numbers, IDs, template names and other left-to-right values inside a sentence or table cell go in
  `<bdi dir="ltr">`.
- Inputs follow the page direction: right aligned in Arabic, left aligned in English. Don't put `dir="ltr"` on an
  input, even for a URL or a token.
- Message text, which may be Arabic or English whatever the page is in, uses `dir="auto"` (the template editor,
  the preview, list excerpts).
- An icon that points somewhere (send, external link, chevrons) is mirrored in Arabic by the list in
  `app/assets/css/main.css`. A new directional icon goes in that list.
- Numbers use Latin digits in both languages (`count()`, `money()`, `compactMoney()` format with `en-US`);
  dates and times use `intlLocale()` (`monthDay()`, `shortDay()`, `timeOfDay()`).

## Before you finish

- [ ] Checked with `bun run demo`: Arabic and English, light and dark, and a phone width (375px).
- [ ] No string outside `t()`; both dictionaries have the new keys; `bun run typecheck` passes.
- [ ] No physical `ml-/mr-/left-/right-` classes on anything that should flip.
- [ ] Screenshots for the pull request come from demo mode, never from a real account.
