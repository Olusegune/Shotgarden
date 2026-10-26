# Decisions

- **Brand:** Shotgarden. Tagline: “Grow an idea into a world.”
- **Scaffold:** official `higgsfield-ai/app-templates` Studio source, preserving its catalog and component contracts.
- **Package registry:** npmjs. The template's Socket registry timed out in this environment.
- **Theme:** dark-only with lime `#d1fe17` reserved for primary creation actions and active states.
- **Credentials:** one server-side Higgsfield credential. The shipped BYOK cookie flow is transitional and will be removed as generation persistence lands.
- **Persistence:** MongoDB via the official driver. Browser history remains only until the server generation lifecycle replaces `useRuns`.
- **Billing defaults:** credits are valued at $0.01 before plan discounts and default markup is 2×; both are environment-configurable.
