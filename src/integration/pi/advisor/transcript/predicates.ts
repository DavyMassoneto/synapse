import { type AgentMessage } from "@earendil-works/pi-agent-core"
import { type ConversationMessage } from "./types"

export function isConversationMessage(message: AgentMessage): message is ConversationMessage {
  return message.role !== "system"
}
