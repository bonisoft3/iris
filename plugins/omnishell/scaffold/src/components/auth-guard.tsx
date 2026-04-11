import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState, type ReactNode } from "react"
import { sessionManager } from "@/lib/auth"

export function AuthGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    async function check() {
      const token = sessionManager.getStoredToken()
      if (!token) {
        navigate({ to: "/login" })
        return
      }
      const payload = await sessionManager.verifyToken(token)
      if (!payload) {
        sessionManager.clearToken()
        navigate({ to: "/login" })
        return
      }
      setAuthed(true)
    }
    check()
  }, [navigate])

  if (!authed) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>
  }

  return <>{children}</>
}
