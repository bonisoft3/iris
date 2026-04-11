import { createFileRoute } from "@tanstack/react-router"
import * as m from "@/paraglide/messages"
import { useLiveQuery } from "@tanstack/react-db"
import { AppShell } from "@/lib/layout"
import { AuthGuard } from "@/components/auth-guard"
import { ErrorFallback } from "@/components/error-boundary"
import { notesCollection } from "@/shared/collections/notes"
import { updateNote, deleteNote } from "@/shared/actions/notes"
import { NoteForm } from "@/components/note-form"
import { useState } from "react"

export const Route = createFileRoute("/notes")({
  component: NotesPage,
  errorComponent: ErrorFallback,
})

function NotesPage() {
  const { data: notes } = useLiveQuery((q) =>
    q
      .from({ note: notesCollection })
      .orderBy(({ note }) => note.updatedAt, "desc")
  )

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  function startEdit(note: { id: string; title: string; content: string }) {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  function saveEdit() {
    if (!editingId) return
    updateNote({ id: editingId, title: editTitle, content: editContent })
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="p-6">
          <h1 className="text-2xl font-bold">{m.notes_title()}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {m.notes_description()}
          </p>

          <div className="mt-6">
            <NoteForm />
          </div>

          <div className="mt-6 space-y-3">
            {notes?.map((note) => (
              <div key={note.id} className="rounded-lg border p-4">
                {editingId === note.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm font-semibold"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">{m.notes_save()}</button>
                      <button onClick={cancelEdit} className="rounded-md border px-3 py-1.5 text-xs font-medium">{m.notes_cancel()}</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold">{note.title}</h3>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(note)} className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted">{m.notes_edit()}</button>
                        <button onClick={() => deleteNote(note.id)} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">{m.notes_delete()}</button>
                      </div>
                    </div>
                    {note.content && <p className="mt-1 text-sm text-muted-foreground">{note.content}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">Updated {new Date(note.updatedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            ))}
            {(!notes || notes.length === 0) && (
              <p className="text-center text-sm text-muted-foreground py-8">{m.notes_empty()}</p>
            )}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  )
}
