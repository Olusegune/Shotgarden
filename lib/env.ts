import "server-only"

import { z } from "zod"

const optionalUrl = z.string().url().optional().or(z.literal(""))

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(32).optional(),
  AUTH_RESEND_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().default("Shotgarden <login@shotgarden.ai>"),
  MONGODB_URI: z.string().min(1).optional(),
  MONGODB_DB: z.string().default("shotgarden"),
  HF_API_BASE_URL: z.string().url().default("https://api.higgsfield.ai"),
  HF_CREDENTIALS: z.string().regex(/^[^:\s]+:[^\s]+$/).optional(),
  HF_WEBHOOK_SECRET: z.string().min(32).optional(),
  HF_WEBHOOK_BASE_URL: optionalUrl,
  CREDIT_USD_VALUE: z.coerce.number().positive().default(0.01),
  CREDIT_MARKUP: z.coerce.number().positive().default(2),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_BASE_URL: optionalUrl,
  CRON_SECRET: z.string().optional(),
})

export type ServerEnv = z.infer<typeof schema>

let cached: ServerEnv | undefined

export function env(): ServerEnv {
  if (cached) return cached
  const result = schema.safeParse(process.env)
  if (!result.success) {
    throw new Error(`Invalid environment configuration: ${z.prettifyError(result.error)}`)
  }
  cached = result.data
  return cached
}

export function requireEnv<K extends keyof ServerEnv>(key: K): NonNullable<ServerEnv[K]> {
  const value = env()[key]
  if (value === undefined || value === "") throw new Error(`Missing required environment variable: ${key}`)
  return value as NonNullable<ServerEnv[K]>
}
