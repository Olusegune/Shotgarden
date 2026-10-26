import Link from "next/link"
import { Sparkles } from "lucide-react"

import { brand } from "@/lib/brand"

const links = [
  ["Explore", "/"],
  ["Image", "/studio?surface=image"],
  ["Video", "/studio?surface=video"],
  ["Audio", "/studio?surface=audio"],
  ["Effects", "/effects"],
  ["Community", "/community"],
  ["Pricing", "/pricing"],
] as const

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-7 px-5">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight uppercase">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          {brand.name}
        </Link>
        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/6 hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link href="/studio" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-95">
            Start creating
          </Link>
        </div>
      </div>
    </header>
  )
}
