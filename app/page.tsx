import Link from "next/link"
import { ArrowRight, AudioLines, ImageIcon, Play, Sparkles } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { brand } from "@/lib/brand"

const tools = [
  { icon: ImageIcon, eyebrow: "IMAGE", title: "Build the frame", copy: "Create art-directed stills, campaigns, characters, and concepts with the strongest image models." },
  { icon: Play, eyebrow: "VIDEO", title: "Put it in motion", copy: "Move from a prompt or reference frame to cinematic motion without leaving your project." },
  { icon: AudioLines, eyebrow: "AUDIO", title: "Give it a voice", copy: "Generate voice, sound, and music alongside the visuals they were made for." },
] as const

export default function HomePage() {
  return (
    <main className="min-h-svh overflow-hidden bg-background">
      <SiteHeader />
      <section className="relative isolate px-5 pb-24 pt-20 sm:pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(55%_70%_at_50%_10%,rgba(209,254,23,.18),transparent_70%)]" />
        <div className="mx-auto max-w-6xl text-center">
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 font-mono text-xs text-primary">
            <Sparkles className="size-3.5" /> ONE STUDIO · EVERY MEDIUM
          </div>
          <h1 className="mx-auto max-w-5xl font-heading text-5xl font-bold leading-[.92] tracking-[-.055em] uppercase sm:text-7xl lg:text-[104px]">
            Grow an idea<br /><span className="text-primary">into a world.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {brand.description} Explore the best creative models through one focused workflow and keep every generation organized.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/studio" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
              Open the studio <ArrowRight className="size-4" />
            </Link>
            <Link href="/community" className="rounded-full border border-white/12 bg-white/4 px-6 py-3 font-semibold hover:bg-white/8">
              Explore creations
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-24 md:grid-cols-3">
        {tools.map(({ icon: Icon, eyebrow, title, copy }) => (
          <Link href={`/studio?surface=${eyebrow.toLowerCase()}`} key={title} className="group min-h-72 rounded-3xl border border-white/8 bg-white/[.025] p-7 transition hover:-translate-y-1 hover:border-primary/30 hover:bg-primary/[.035]">
            <div className="mb-20 flex items-center justify-between">
              <span className="font-mono text-xs tracking-[.18em] text-primary">{eyebrow}</span>
              <Icon className="size-5 text-muted-foreground transition group-hover:text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-semibold uppercase">{title}</h2>
            <p className="mt-3 leading-6 text-muted-foreground">{copy}</p>
          </Link>
        ))}
      </section>
    </main>
  )
}
