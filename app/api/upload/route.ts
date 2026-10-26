import { NextResponse } from "next/server"

import { createPlatformClient, PlatformError } from "@/generation/platform"
import { requireUploadContentType } from "@/generation/upload-contract"
import { env, requireEnv } from "@/lib/env"

export async function POST(request: Request): Promise<NextResponse> {
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin)
    return failure(403, "Cross-origin upload requests are not allowed.")

  let contentType: string
  try {
    const body: unknown = await request.json()
    contentType = requireUploadContentType(
      body && typeof body === "object" && "contentType" in body
        ? body.contentType
        : null
    )
  } catch (error) {
    return failure(
      400,
      error instanceof SyntaxError
        ? "Invalid upload request."
        : "Unsupported file type. Use JPEG, PNG, WebP, GIF, MP4, or WAV."
    )
  }

  try {
    const ticket = await createPlatformClient({
      apiKey: requireEnv("HF_CREDENTIALS"),
      baseUrl: env().HF_API_BASE_URL,
    }).createUpload(contentType)
    return NextResponse.json(ticket, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    const status = error instanceof PlatformError ? error.status : 502
    console.error("[upload] Could not prepare reference upload", { status })
    if (status === 401 || status === 403)
      return failure(
        status,
        "The generation service rejected the platform credentials."
      )
    if (status === 429)
      return failure(
        429,
        "Higgsfield upload rate limit reached. Wait a moment and try again."
      )
    return failure(
      502,
      "Could not prepare reference upload with Higgsfield. Try again."
    )
  }
}

function failure(status: number, error: string): NextResponse {
  return NextResponse.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } }
  )
}
