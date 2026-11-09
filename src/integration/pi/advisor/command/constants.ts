import { type Cancelled } from "#synapse/modules"

export const DISABLE_COMMAND = "off"

export const THINKING_COMMAND = "thinking"

export const COMPLETION_LIMIT = 40

export const MODEL_SELECTION_LIMIT = 100

export const CANCELLED_SELECTION: Cancelled = { kind: "cancelled" }
