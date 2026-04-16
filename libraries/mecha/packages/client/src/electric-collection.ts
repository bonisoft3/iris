import { ShapeStream } from "@electric-sql/client"

export interface ElectricCollectionConfig {
  electricUrl: string
  table: string
  key: string
  where?: string
}

export function electricCollectionOptions(config: ElectricCollectionConfig) {
  return {
    getKey: (item: any) => item[config.key],

    sync: (params: {
      collection: any
      begin: (options?: { immediate?: boolean }) => void
      write: (message: any) => void
      commit: () => void
      markReady: () => void
      truncate: () => void
    }) => {
      const { begin, write, commit, markReady } = params

      const stream = new ShapeStream({
        url: `${config.electricUrl}/v1/shape`,
        params: {
          table: config.table,
          ...(config.where ? { where: config.where } : {}),
        },
      })

      stream.subscribe((messages: any[]) => {
        if (messages.length === 0) return
        begin()
        for (const msg of messages) {
          if (msg.headers?.operation === "insert" || msg.headers?.operation === "update") {
            write({ type: msg.headers.operation, value: msg.value })
          } else if (msg.headers?.operation === "delete") {
            write({ type: "delete", key: msg.value?.[config.key] })
          } else if (msg.headers?.control === "up-to-date") {
            // Snapshot complete
          }
        }
        commit()

        // Check if we got an up-to-date control message
        const upToDate = messages.some((m: any) => m.headers?.control === "up-to-date")
        if (upToDate) {
          markReady()
        }
      })

      return () => {
        stream.unsubscribeAll()
      }
    },
  }
}
