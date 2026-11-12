import { type AssistantMessage, type UserMessage } from "@earendil-works/pi-ai"
import { COOLDOWN_ASSISTANT_FIELDS } from "./constants"

export function failedAssistantMessage(errorMessage: string): AssistantMessage {
  return { ...COOLDOWN_ASSISTANT_FIELDS, content: [], stopReason: "error", errorMessage }
}

export function completedAssistantMessage(): AssistantMessage {
  return { ...COOLDOWN_ASSISTANT_FIELDS, content: [{ type: "text", text: "pronto" }], stopReason: "stop" }
}

export function userMessage(): UserMessage {
  return { role: "user", content: "olá", timestamp: 0 }
}
