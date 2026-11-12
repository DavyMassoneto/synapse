import { type ContextEvent } from "@earendil-works/pi-coding-agent"

export function responseRulesContextEvent(): ContextEvent {
  return { type: "context", messages: [{ role: "user", content: "Olá", timestamp: 0 }] }
}
