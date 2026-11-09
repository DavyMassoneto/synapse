import { type AdvisorToolOutput } from "./types"

export function toolFailure(message: string): AdvisorToolOutput {
  return { content: [{ type: "text", text: message }], details: {}, isError: true }
}
