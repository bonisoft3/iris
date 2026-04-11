import { z } from "zod"
import { notesCollection } from "../collections/notes"

const createNoteInput = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().default(""),
})

const updateNoteInput = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  content: z.string().optional(),
})

export function createNote(input: z.infer<typeof createNoteInput>) {
  const validated = createNoteInput.parse(input)
  const now = new Date().toISOString()
  notesCollection.insert({
    id: crypto.randomUUID(),
    title: validated.title,
    content: validated.content,
    createdAt: now,
    updatedAt: now,
  })
}

export function updateNote(input: z.infer<typeof updateNoteInput>) {
  const validated = updateNoteInput.parse(input)
  notesCollection.update(validated.id, (draft) => {
    if (validated.title !== undefined) draft.title = validated.title
    if (validated.content !== undefined) draft.content = validated.content
    draft.updatedAt = new Date().toISOString()
  })
}

export function deleteNote(id: string) {
  notesCollection.delete(id)
}
