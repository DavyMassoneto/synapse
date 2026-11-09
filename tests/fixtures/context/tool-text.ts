import { type AdvisorToolOutput } from "#synapse/integration"

export function toolText(result: AdvisorToolOutput): string {
  const [content] = result.content
  if (content?.type === "text") {
    return content.text
  }
  throw new Error("conteúdo não textual")
}
