import type { Meta, StoryObj } from "@storybook/react"
import { within, userEvent, expect } from "@storybook/test"
import { NoteForm } from "@/components/note-form"

const meta: Meta<typeof NoteForm> = {
  title: "Components/NoteForm",
  component: NoteForm,
  parameters: { layout: "padded" },
}

export default meta
type Story = StoryObj<typeof NoteForm>

export const Empty: Story = {
  render: () => <div className="max-w-md"><NoteForm /></div>,
}

export const WithValidation: Story = {
  render: () => <div className="max-w-md"><NoteForm /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Try to submit empty — should show validation error
    const submitBtn = canvas.getByText("Add Note")
    await userEvent.click(submitBtn)

    // Fill in title
    const titleInput = canvas.getByPlaceholderText("Note title...")
    await userEvent.type(titleInput, "My Note")
    await expect(titleInput).toHaveValue("My Note")
  },
}
