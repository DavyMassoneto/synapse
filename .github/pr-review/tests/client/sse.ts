import { type ChatMessage } from "#synapse/client"

export function sseOf(...parts: string[]): string {
  const events = parts.map((part) => `data: ${JSON.stringify({ choices: [{ delta: { content: part } }] })}\n\n`)
  return `${events.join("")}data: [DONE]\n\n`
}

export const MESSAGES: ChatMessage[] = [{ role: "user", content: "oi" }]
