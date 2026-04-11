import { createLayout } from "../../../src/layout/create-layout"
import { Home, StickyNote, Settings, Info } from "lucide-react"

export const { AppShell } = createLayout({
  items: [
    { path: "/", label: "Home", icon: Home },
    { path: "/notes", label: "Notes", icon: StickyNote },
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/about", label: "About", icon: Info },
  ],
})
