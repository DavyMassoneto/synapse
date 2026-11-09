import { type ChatMessage } from "#synapse/client"

export function sseOf(...chunks: string[]): string {
  const events = chunks.map((chunk) => `data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`)
  return `${events.join("")}data: [DONE]\n\n`
}

export const MESSAGES: ChatMessage[] = [{ role: "user", content: "oi" }]
