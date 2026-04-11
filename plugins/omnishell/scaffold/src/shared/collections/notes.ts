import { createCollection, localOnlyCollectionOptions } from "@tanstack/react-db"
import { noteSchema, type Note } from "../schemas/note"

export const notesCollection = createCollection<Note>(
  localOnlyCollectionOptions({
    id: "notes",
    getKey: (item) => item.id,
    schema: noteSchema,
    initialData: [
      {
        id: "demo-1",
        title: "Welcome to Omnishell",
        content: "This note is stored in TanStack DB — a local-only collection with optimistic writes.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  })
)
