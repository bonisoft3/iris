import { createFileRoute, useNavigate } from "@tanstack/react-router"
import * as m from "@/paraglide/messages"
import { z } from "zod"
import { AppShell } from "@/lib/layout"
import { ErrorFallback } from "@/components/error-boundary"
import { cn } from "@/lib/utils"
import { AuthGuard } from "@/components/auth-guard"
import { useState } from "react"
import { setLocale, getLocale } from "@/paraglide/runtime"
import type { Locale } from "@/paraglide/runtime"

const settingsSearchSchema = z.object({
  tab: z.enum(["profile", "appearance", "notifications"]).default("profile").catch("profile"),
})

export const Route = createFileRoute("/settings")({
  validateSearch: settingsSearchSchema,
  component: SettingsPage,
  errorComponent: ErrorFallback,
})

const tabs = [
  { id: "profile" as const, label: "Profile" },
  { id: "appearance" as const, label: "Appearance" },
  { id: "notifications" as const, label: "Notifications" },
]

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "he", label: "עברית", flag: "🇮🇱" },
]

function LanguageSwitcher() {
  const [current, setCurrent] = useState(() => {
    try { return getLocale() } catch { return "en" }
  })

  function switchLanguage(code: string) {
    setCurrent(code)
    setLocale(code as Locale)
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Language</h3>
      <p className="text-sm text-muted-foreground">
        Choose your preferred language. Translations powered by Paraglide JS.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
              current === lang.code
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:bg-muted",
            )}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function SettingsPage() {
  const { tab } = Route.useSearch()
  const navigate = useNavigate()

  return (
    <AuthGuard>
      <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold">{m.settings_title()}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {m.settings_description()}
        </p>

        <div className="mt-6">
          <div className="flex gap-1 border-b">
            {tabs.map((t) => (
              <a
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => navigate({ search: { tab: t.id } })}
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </a>
            ))}
          </div>

          <div className="mt-6 rounded-lg border p-6">
            {tab === "profile" && (
              <div>
                <h3 className="font-semibold">Profile Settings</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  URL: /settings?tab=profile
                </p>
              </div>
            )}
            {tab === "appearance" && (
              <div className="space-y-6">
                <LanguageSwitcher />
                <div>
                  <h3 className="font-semibold">Theme</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Use the toggle in the top-right corner to switch between light and dark mode.
                  </p>
                </div>
              </div>
            )}
            {tab === "notifications" && (
              <div>
                <h3 className="font-semibold">Notification Settings</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  URL: /settings?tab=notifications
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </AppShell>
    </AuthGuard>
  )
}
