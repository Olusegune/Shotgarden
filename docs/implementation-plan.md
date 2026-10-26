# Shotgarden implementation plan

## Product direction

Shotgarden is a dark, cinematic AI studio for generating images, video, and audio. The public promise is **“Grow an idea into a world.”** The UI uses the official Higgsfield Studio component contracts while replacing its branding, browser-owned credentials, and local-only persistence.

## Delivery sequence

1. **Foundation** — scaffold, brand system, public navigation, strict environment schema, Mongo connection, baseline checks.
2. **Identity and persistence** — Auth.js magic links, Resend email, Mongo users/sessions, server-owned projects and generation history.
3. **Generation core** — platform credentials, catalog validation, submit/cancel/status lifecycle, signed uploads, webhooks, reconciliation, R2 archival.
4. **Model surfaces** — complete image/video catalog audit, audio catalog and playback, picker metadata, mapper tests.
5. **Credits and billing** — ledger, two balance buckets, pricing rules, Stripe Checkout/Portal/webhooks, receipts.
6. **Product surfaces** — Effects, Community, Assets, Projects, Pricing, Account, Admin, legal pages.
7. **Hardening** — access-control tests, idempotency tests, Playwright journeys, responsive/a11y audit, deployment runbook.

## External checkpoints

Live end-to-end verification requires credentials for Higgsfield, MongoDB Atlas, Resend, Stripe, and Cloudflare R2. Development must remain buildable without them; features that use a provider fail with a clear configuration error at request time.
