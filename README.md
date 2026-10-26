# Shotgarden

**Grow an idea into a world.**

Shotgarden is a dark, cinematic AI studio for generating images, video, and audio through the Higgsfield API. It uses Next.js 16, React 19, TypeScript, Tailwind CSS, Auth.js, MongoDB, Stripe, Resend, and Cloudflare R2.

## Local development

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Public product pages work without provider credentials. Generation requests require `HF_CREDENTIALS`; authentication and persistent history require MongoDB and Resend.

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Model catalog

Models live in `generation/catalog/models/`, one model family per file. Run `pnpm models` after changing the catalog. Never accept a model path from the browser; the server resolves it from the catalog.

## Documentation

- `docs/implementation-plan.md` — delivery sequence and external checkpoints
- `docs/decisions.md` — product and architecture decisions

The initial studio components are adapted from Higgsfield's public app template. Provider credentials stay server-side in Shotgarden.
