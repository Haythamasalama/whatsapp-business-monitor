---
name: whatsapp-cloud-api
description: Use when code in WhatsApp Business Monitor calls Meta's Graph API for WhatsApp Business (server/utils/graph.ts and the routes that use it), or when someone asks why Meta rejected or refused a template, what an error code means, or how sends, reads, clicks and spend are counted. Covers the token and API version, every endpoint and field the app uses, paging, template rules and edit limits, template analytics and pricing analytics, statuses, quality and tiers, the error-code map, the copy and paste text format, and what never to do against a real account.
---

# WhatsApp Cloud API

The app reads and edits **message templates** and reads **analytics and spend** through Meta's Graph API.
It does not send messages.

## Calls

- Base URL `https://graph.facebook.com/{version}/{path}`. The version is set per account; the default is
  `DEFAULT_VERSION` (`v23.0`) in `server/utils/accounts.ts`.
- `Authorization: Bearer {token}`: a system-user token with `whatsapp_business_management`. A credit line's
  balance also needs `business_management`.
- Every call goes through `graph(account, method, path, query, body)` in `server/utils/graph.ts`: 30 second
  timeout, never throws, returns Meta's JSON or `{ error }`. Wrap it in `orFail()` in a route.
- `graphFields(account, path, [fullFields, fallbackFields])` retries with the next field list when Meta answers
  code 100, because accounts and API versions differ in the fields they know. Put the richest list first.
- Lists page with `limit` and `after = response.paging.cursors.after` while `response.paging.next` is set,
  capped at `MAX_PAGES` (20).

## Endpoints in use

| Purpose | Call | Notes |
|---|---|---|
| Find accounts for a token | `GET debug_token?input_token={token}` | WABA ids are the `target_ids` of the `whatsapp_business_*` entries in `data.granular_scopes` |
| Account | `GET {waba}?fields=name,currency,timezone_id,account_review_status,owner_business_info` | `owner_business_info.id` is the business, used for credit |
| Phone numbers | `GET {waba}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,whatsapp_business_manager_messaging_limit,status,name_status,throughput` | `messaging_limit_tier` is deprecated; it is only the fallback field set |
| Account details and health | `GET {waba}?fields=account_review_status,business_verification_status,ownership_type,primary_funding_id,health_status,owner_business_info` | no `primary_funding_id` = paid messages are not sent |
| Numbers in detail | `GET {waba}/phone_numbers?fields=…,new_display_name,new_name_status,is_official_business_account,official_business_account,health_status,account_mode` | `health_status.can_send_message` AVAILABLE/LIMITED/BLOCKED with `entities[].errors[].possible_solution` |
| Template health | `GET {waba}/message_templates?fields=id,name,language,health_status` | only non-AVAILABLE ones are shown |
| Activity log | `GET {waba}/activities?fields=id,actor_business_id,actor_id,category,event_type,timestamp&limit=25&after=` | paged, newest first |
| People with access | `GET {waba}/assigned_users?business={business}&fields=id,name,user_type,tasks` | |
| Business profile | `GET/POST {phone}/whatsapp_business_profile` | about ≤ 139, address ≤ 256, description ≤ 512, email ≤ 128, ≤ 2 websites |
| Profile photo | `GET debug_token` → `app_id`; `POST {app_id}/uploads` → `POST {upload_id}` (`Authorization: OAuth`, `file_offset: 0`) → `h`; then `profile_picture_handle` | JPEG/PNG ≤ 5 MB, magic bytes checked |
| Display name | `POST {phone}?new_display_name=` | 10 per 30 days; re-register within 14 days of approval |
| Green badge | read `official_business_account{oba_status}`; `POST {phone}/official_business_account` | 5–10 supporting links; 30 days after a refusal |
| Username | `GET/POST {phone}/username`, `GET {phone}/username_suggestions` | 2 changes per 14 days |
| Chat start | read `fields=conversational_automation`; `POST {phone}/conversational_automation?enable_welcome_message&prompts&commands` | ≤ 4 prompts × 80, ≤ 30 commands (32/256), no emoji |
| QR codes | `GET/POST {phone}/message_qrdls`, `DELETE …/{code}`, image `GET …/{code}?fields=qr_image_url.format(PNG\|SVG)` | message ≤ 140, ≤ 2,000 per number |
| Blocked people | `GET/POST/DELETE {phone}/block_users` with `{ messaging_product, block_users: [{ user }] }` | only people who wrote in the last 24 h (131047); ≤ 1,000 per call |
| Profile photo | `GET {phone_id}/whatsapp_business_profile?fields=profile_picture_url` | first `https://` URL among the account's numbers |
| Spend this month | `GET {waba}?fields=pricing_analytics.start({unix}).end({unix}).granularity(DAILY).dimensions(["PRICING_CATEGORY"])` | `data_points[]` have `start`, `cost`, `volume`, `pricing_category`; summed in `sumSpend()` |
| Credit line | `GET {business}/extendedcredits?fields=id,legal_entity_name,balance,credit_available,max_balance` | Meta has no balance API for card billing |
| List templates | `GET {waba}/message_templates?fields=id,name,language,status,category,parameter_format,components,quality_score,rejected_reason&limit=100` | one row per name **and** language |
| Create a template | `POST {waba}/message_templates` with `{ name, language, category, parameter_format: 'POSITIONAL', components }` | answers `{ id, status, category }`; status starts `PENDING` |
| Edit a template | `GET {template_id}?fields=id,name,language,status,parameter_format,components`, then `POST {template_id}` with `{ components }` | media headers and buttons are sent back exactly as they came |
| Template analytics | `GET {waba}/template_analytics?start&end&granularity=DAILY&metric_types=sent,delivered,read,cost,clicked&template_ids=[…]&limit=1000` | **at most 10 ids** per request, so the route batches them |
| Turn analytics on | `POST {waba}?is_enabled_for_insights=true` | **cannot be undone**; the page asks first |

Components the app builds (`textComponents()` in `server/utils/templates.ts`):

```json
[
  { "type": "HEADER", "format": "TEXT", "text": "Order update" },
  { "type": "BODY", "text": "Hello {{1}}, order {{2}} is on its way.", "example": { "body_text": [["Sara", "A-1042"]] } },
  { "type": "FOOTER", "text": "Reply STOP to opt out" }
]
```

## Template rules

The page and the server check the same rules (`templateProblems()` and `templateWarnings()` in
`shared/utils/rules.ts`), so Meta rarely refuses what passes them:

- Name: `^[a-z0-9_]{1,512}$`. Category: `UTILITY`, `MARKETING` or `AUTHENTICATION`. Meta may move a `UTILITY`
  template to `MARKETING` when it reads as promotion; the create answer shows the category it chose.
- Language: Meta's code, `^[a-z]{2,3}(_[A-Z]{2})?$`. `en` and `en_US` are different templates; use the code the
  sending system asks for.
- Body: required, at most 1024 characters. Variables are positional, `{{1}}`, `{{2}}`…, numbers only, starting at
  1 with no gaps. Each variable needs one sample value, in order; Meta reviews against them, so make them
  realistic and never real customer data.
- Header and footer: text only here, at most 60 characters each, no variables.
- Warning, not an error: a body that starts or ends with a variable. Meta used to reject those and still
  rejects some.
- Editing: only `APPROVED`, `REJECTED` or `PAUSED` templates, and only positional ones (named variables are
  edited in WhatsApp Manager). An approved template can be edited once every 24 hours and 10 times in 30 days.
- A deleted template's name can't be used again for 30 days. The app never deletes templates.

## Analytics and spend

- `template_analytics` gives per day: `sent`, `delivered`, `read`, `clicked[]` (summed `count`) and `cost[]`
  (the entry with `type: 'amount_spent'`). The route reads the last 30 days.
- Reads and clicks are counted for 7 days after the send, so a day's read rate can pass 100%; `rate()` caps the
  number shown at 100.
- Spend comes from `pricing_analytics` by pricing category: `MARKETING`, `MARKETING_LITE`, `UTILITY`,
  `AUTHENTICATION`, `AUTHENTICATION_INTERNATIONAL`, `SERVICE`.
- Template analytics stay empty until they are turned on for the WABA. Turning them on is permanent, so only the
  user, after the confirmation, ever does it.

## Statuses Meta returns

Labels and colours live in `app/utils/labels.ts`; unknown codes show as Meta wrote them.

- Template status: `APPROVED`, `PENDING`, `IN_APPEAL`, `PAUSED`, `REJECTED`, `DISABLED`, `LIMIT_EXCEEDED`,
  `PENDING_DELETION`, `DELETED`, `ARCHIVED`. Rejected ones carry `rejected_reason` (`ABUSIVE_CONTENT`,
  `INVALID_FORMAT`, `PROMOTIONAL`, `TAG_CONTENT_MISMATCH`, `INCORRECT_CATEGORY`, `SCAM`).
- Quality (`quality_rating` on numbers, `quality_score.score` on templates): `GREEN`, `YELLOW`, `RED`, `UNKNOWN`.
- Phone `status`: `CONNECTED`, `PENDING`, `FLAGGED`, `RATE_LIMITED`, `UNVERIFIED`, `RESTRICTED`, `BANNED`,
  `DISCONNECTED`, `MIGRATED`, `DELETED`. Display `name_status`: `APPROVED`, `AVAILABLE_WITHOUT_REVIEW`,
  `PENDING_REVIEW`, `DECLINED`, `EXPIRED`, `NONE`.
- `whatsapp_business_manager_messaging_limit` (and the deprecated `messaging_limit_tier`): `TIER_50`, `TIER_250`, `TIER_1K`, `TIER_2K`, `TIER_10K`, `TIER_100K`, `TIER_UNLIMITED`,
  `UNTIERED` (customers reached per 24 hours, shared by the business portfolio).

## Error codes

`META_ERRORS` in `shared/utils/rules.ts` turns these into a translated sentence (`errorText()`); any other code
shows Meta's `error_user_title` and `error_user_msg`, or `message`.

| Code | Meaning | Key |
|---|---|---|
| 190 | token expired or not valid | `metaErrors.tokenExpired` |
| 200, 10 | the token has no permission for this data | `metaErrors.permission` |
| 3 | the app behind the token lacks the capability | `metaErrors.appPermission` |
| 4, 17, 32, 613, 80008 | rate limited | `metaErrors.rateLimit` |
| 368 | temporarily restricted for a policy violation | `metaErrors.restricted` |
| 131031 | account locked | `metaErrors.locked` |
| 100 | unknown field or bad parameter | `graphFields()` tries the next field list |

A new code gets a key in both `shared/locales/ar.ts` and `en.ts` and an entry in `META_ERRORS`.

## Copy and paste text

`app/utils/templateCode.ts` turns templates into text and back (`toText()`, `fromText()`). Labels are written in
the interface language and read in either:

```text
Name: order_shipped
Category: Utility
----------------
Language: en
Header: Order update
Hello {{1}}, order {{2}} is on its way.
Footer: Reply STOP to opt out

{{1}} = Sara
{{2}} = A-1042
```

One block per language after a line of dashes. `fromText()` also reads the older format: a bare name line
with blocks split by dashes, where a block without a language line is `ar` if it has Arabic letters and `en`
otherwise.

## Safety

- Never change a profile, name, username, badge, chat start, QR code or block list against a real account
  while developing; the demo answers every `/api/business` write after the same checks.
- Never create or edit a template, and never turn analytics on, against a real account while developing or
  testing. Use `bun run demo`, which answers every call itself, or an account made for testing.
- Never print, log, paste or commit a token. Ask the person to enter it in the app, which keeps it on the server.
- Sample values and screenshots use made-up names and numbers only.
