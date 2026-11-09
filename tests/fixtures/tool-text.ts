import { type AdvisorToolOutput } from "#synapse/integration"

export function toolText(result: AdvisorToolOutput): string {
  const content = result.content[0]
  if (content === undefined || content.type !== "text") {
    throw new Error("conteúdo não textual")
  }
  return content.text
}
