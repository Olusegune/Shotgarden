import { MarketingPage } from "@/components/marketing-page"

export const metadata = { title: "Log in" }
export default function LoginPage() {
  return <MarketingPage eyebrow="WELCOME BACK" title="Your worlds are waiting." description="Passwordless email sign-in will activate when Resend, MongoDB, and AUTH_SECRET are configured." />
}
