import { type ChatMessage } from "#synapse/client"
import { type FinishReason } from "./types"

export function sseOf(...chunks: string[]): string {
  const events = chunks.map((chunk) => `data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`)
  return `${events.join("")}data: [DONE]\n\n`
}

export function sseWithFinish(reason: FinishReason, ...chunks: string[]): string {
  const ending = `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: reason }] })}\n\ndata: [DONE]\n\n`
  return sseOf(...chunks).replace("data: [DONE]\n\n", ending)
}

export const MESSAGES: ChatMessage[] = [{ role: "user", content: "oi" }]
