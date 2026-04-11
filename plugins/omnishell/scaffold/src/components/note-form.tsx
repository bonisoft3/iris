import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { createNote } from "@/shared/actions/notes"
import * as m from "@/paraglide/messages"

const noteFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().default(""),
})

export function NoteForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm({
    defaultValues: { title: "", content: "" },
    validators: {
      onSubmit: noteFormSchema,
    },
    onSubmit: async ({ value }) => {
      createNote(value)
      onSuccess?.()
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-3"
    >
      <form.Field name="title">
        {(field) => (
          <div>
            <input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={m.notes_add_placeholder()}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            {field.state.meta.isTouched && !field.state.meta.isValid && (
              <p className="mt-1 text-xs text-red-600">
                {field.state.meta.errors.map((e) => e.message).join(", ")}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="content">
        {(field) => (
          <div>
            <textarea
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Content (optional)"
              rows={2}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : m.notes_add_button()}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}
