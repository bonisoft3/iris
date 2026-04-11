import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { within, userEvent, expect } from "@storybook/test"

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: { id: string; title: string; content: string; updatedAt: string }
  onEdit: (note: { id: string; title: string; content: string }) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{note.title}</h3>
        <div className="flex gap-1">
          <button onClick={() => onEdit(note)} className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted">Edit</button>
          <button onClick={() => onDelete(note.id)} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
        </div>
      </div>
      {note.content && <p className="mt-1 text-sm text-muted-foreground">{note.content}</p>}
      <p className="mt-2 text-xs text-muted-foreground">Updated {new Date(note.updatedAt).toLocaleString()}</p>
    </div>
  )
}

function NoteCardEditing({
  title,
  content,
  onSave,
  onCancel,
}: {
  title: string
  content: string
  onSave: (title: string, content: string) => void
  onCancel: () => void
}) {
  const [t, setT] = useState(title)
  const [c, setC] = useState(content)
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <input type="text" value={t} onChange={(e) => setT(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm font-semibold" />
      <textarea value={c} onChange={(e) => setC(e.target.value)} rows={3} className="w-full rounded-md border px-3 py-2 text-sm" />
      <div className="flex gap-2">
        <button onClick={() => onSave(t, c)} className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Save</button>
        <button onClick={onCancel} className="rounded-md border px-3 py-1.5 text-xs font-medium">Cancel</button>
      </div>
    </div>
  )
}

const sampleNote = {
  id: "1",
  title: "Sample Note",
  content: "This is a sample note with some content to demonstrate the card layout.",
  updatedAt: new Date().toISOString(),
}

const meta: Meta = {
  title: "Components/NoteCard",
  parameters: { layout: "padded" },
}

export default meta

export const ViewMode: StoryObj = {
  render: () => <div className="max-w-md"><NoteCard note={sampleNote} onEdit={() => {}} onDelete={() => {}} /></div>,
}

export const EditMode: StoryObj = {
  render: () => (
    <div className="max-w-md">
      <NoteCardEditing
        title={sampleNote.title}
        content={sampleNote.content}
        onSave={() => {}}
        onCancel={() => {}}
      />
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)

    // Verify form elements are present
    const titleInput = canvas.getByDisplayValue("Sample Note")
    await expect(titleInput).toBeInTheDocument()

    // Edit the title
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, "Updated Title")
    await expect(titleInput).toHaveValue("Updated Title")

    // Verify save and cancel buttons exist
    await expect(canvas.getByText("Save")).toBeInTheDocument()
    await expect(canvas.getByText("Cancel")).toBeInTheDocument()
  },
}

export const EmptyContent: StoryObj = {
  render: () => <div className="max-w-md"><NoteCard note={{ ...sampleNote, content: "" }} onEdit={() => {}} onDelete={() => {}} /></div>,
}

export const LongTitle: StoryObj = {
  render: () => <div className="max-w-md"><NoteCard note={{ ...sampleNote, title: "This is a very long note title that should wrap properly without breaking the layout or overlapping the action buttons" }} onEdit={() => {}} onDelete={() => {}} /></div>,
}
