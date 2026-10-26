import { MODELS } from "@/generation/catalog"
import { StudioTemplate } from "@/layouts/studio"

import { NoModels } from "@/components/studio/no-models"

export const metadata = { title: "Studio" }

export default function StudioPage() {
  if (MODELS.length === 0) return <NoModels />
  return <StudioTemplate />
}
