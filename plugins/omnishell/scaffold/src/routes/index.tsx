import { createFileRoute } from "@tanstack/react-router"
import { AppShell } from "@/lib/layout"
import { AuthGuard } from "@/components/auth-guard"
import * as m from "@/paraglide/messages"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  return (
    <AuthGuard>
      <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold">{m.home_title()}</h1>
        <p className="mt-2 text-muted-foreground">
          {m.home_description()}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">URL-as-State</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Visit Settings to see tabs controlled via URL search params.
              Copy the URL and paste it back for the same state.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Config-Driven Layout</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sidebar on desktop, bottom nav on mobile. Adding a route means
              adding one line to nav-config.ts.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Visual Lint</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              10 ESLint rules enforce architectural rails. Playwright checks catch
              layout bugs. AI vision reviews aesthetics.
            </p>
          </div>
          <a
            href="http://localhost:6006"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border p-4 transition-colors hover:border-primary hover:bg-primary/5"
          >
            <h3 className="font-semibold">Storybook</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse component stories with interaction tests, a11y checks,
              and viewport matrix. Run <code className="text-xs bg-muted px-1 py-0.5 rounded">bun run storybook</code> first.
            </p>
          </a>
        </div>
      </div>
      </AppShell>
    </AuthGuard>
  )
}
