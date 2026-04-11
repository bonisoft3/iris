import type { Meta, StoryObj } from "@storybook/react"
import { within, userEvent, expect } from "@storybook/test"
import { ThemeToggle } from "@/components/theme-toggle"

const meta: Meta<typeof ThemeToggle> = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof ThemeToggle>

export const Default: Story = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole("button", { name: "Toggle theme" })
    await expect(toggle).toBeInTheDocument()

    // Click to toggle
    await userEvent.click(toggle)
    // The button should still be there after toggle
    await expect(toggle).toBeInTheDocument()
  },
}
