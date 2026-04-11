import type { Meta, StoryObj } from "@storybook/react"
import { within, userEvent, expect } from "@storybook/test"
import { ErrorFallback } from "@/components/error-boundary"

const meta: Meta<typeof ErrorFallback> = {
  title: "Components/ErrorFallback",
  component: ErrorFallback,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof ErrorFallback>

export const Default: Story = {
  args: {
    error: new Error("Something went wrong while loading the page"),
    reset: () => {},
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)

    // Verify error message is displayed
    await expect(canvas.getByText("Something went wrong")).toBeInTheDocument()
    await expect(canvas.getByText(/Something went wrong while loading/)).toBeInTheDocument()

    // Verify retry button exists and is clickable
    const retryBtn = canvas.getByText("Try again")
    await expect(retryBtn).toBeInTheDocument()
    await userEvent.click(retryBtn)
  },
}

export const LongMessage: Story = {
  args: {
    error: new Error("NetworkError: Failed to fetch /api/data after 3 retries. The server may be temporarily unavailable."),
    reset: () => alert("Reset clicked"),
  },
}
