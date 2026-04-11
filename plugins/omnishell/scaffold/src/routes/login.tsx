import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { sessionManager } from "@/lib/auth"
import * as m from "@/paraglide/messages"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleRegister() {
    setLoading(true)
    setError("")
    try {
      await fetch("/auth/register/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "User" }),
      })

      const res = await fetch("/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: "dev-auto", name: name || "User" }),
      })

      if (!res.ok) throw new Error("Registration failed")

      const data = await res.json()
      // Create session token directly — Set-Cookie headers are stripped by MSW service worker
      await sessionManager.createToken(data.userId)

      navigate({ to: "/" })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin() {
    setLoading(true)
    setError("")
    try {
      await fetch("/auth/authenticate/start", { method: "POST" })

      const res = await fetch("/auth/authenticate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: "dev-auto" }),
      })

      if (!res.ok) throw new Error("Authentication failed")

      const data = await res.json()
      // Create session token directly — Set-Cookie headers are stripped by MSW service worker
      await sessionManager.createToken(data.userId)

      navigate({ to: "/" })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-background p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{m.login_title()}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{m.login_subtitle()}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">{m.login_name_label()}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={m.login_name_placeholder()}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "..." : m.login_register()}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">{m.login_or()}</span></div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {loading ? "..." : m.login_signin()}
          </button>
        </div>

        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <p className="text-center text-xs text-muted-foreground">{m.login_dev_mode()}</p>
      </div>
    </div>
  )
}
