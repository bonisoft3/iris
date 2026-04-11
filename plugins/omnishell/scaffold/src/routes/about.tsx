import { createFileRoute } from "@tanstack/react-router"
import * as m from "@/paraglide/messages"
import { AppShell } from "@/lib/layout"
import { ErrorFallback } from "@/components/error-boundary"
import { AuthGuard } from "@/components/auth-guard"

export const Route = createFileRoute("/about")({
  component: AboutPage,
  errorComponent: ErrorFallback,
})

function AboutPage() {
  return (
    <AuthGuard>
      <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold">{m.about_title()}</h1>
        <p className="mt-2 text-muted-foreground">
          {m.about_description()}
        </p>
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Rails</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Locked Tailwind preset, shadcn/ui components only, business/UI separation.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Lint Layers</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              ESLint, Storybook, Playwright, AI Vision, AI Regression.
              Each layer catches different bug classes.
            </p>
          </div>
        </div>
      </div>
      </AppShell>
    </AuthGuard>
  )
}
