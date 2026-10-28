import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { SiteHeader } from "@/components/site-header"

export function MarketingPage({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <main className="min-h-svh bg-background">
      <SiteHeader />
      <section className="mx-auto flex min-h-[calc(100svh-64px)] max-w-5xl flex-col items-start justify-center px-6 py-24">
        <p className="font-mono text-xs tracking-[.2em] text-primary">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl font-heading text-5xl font-bold leading-[.95] tracking-[-.045em] uppercase sm:text-7xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
        <Link href="/studio" className="mt-9 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground">
          Open Shotgarden <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  )
}
