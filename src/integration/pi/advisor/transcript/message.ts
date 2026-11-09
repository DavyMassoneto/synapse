import { type TranscriptMessage } from "#synapse/modules"
import { convertAssistant } from "./assistant"
import { convertContent } from "./content"
import { type ConversationMessage } from "./types"

export function convertMessage(message: ConversationMessage): TranscriptMessage {
  switch (message.role) {
    case "user":
      return { kind: "user", blocks: convertContent(message.content) }
    case "assistant":
      return convertAssistant(message)
    case "toolResult":
      return {
        kind: "toolResult",
        tool: message.toolName,
        error: message.isError,
        blocks: convertContent(message.content),
      }
    case "bashExecution":
      return {
        kind: "shell",
        command: message.command,
        hidden: message.excludeFromContext === true,
        blocks: [{ kind: "text", text: message.output }],
      }
    case "custom":
      return {
        kind: "custom",
        customType: message.customType,
        blocks: convertContent(message.content),
      }
    case "branchSummary":
    case "compactionSummary":
      return { kind: "summary", blocks: [{ kind: "text", text: message.summary }] }
  }
}
