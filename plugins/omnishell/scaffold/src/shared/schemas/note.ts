import { z } from "zod"

export const noteSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Note = z.infer<typeof noteSchema>
