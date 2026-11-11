import { type AssistantMessage } from "@earendil-works/pi-ai"
import { type TranscriptBlock, type TranscriptMessage } from "#synapse/modules"
import { type ContentBlock, type ConversationMessage, type MessageContent, type TranscriptSource } from "./types"

function convertBlock(block: ContentBlock): TranscriptBlock {
  if (block.type === "text") {
    return { kind: "text", text: block.text }
  }
  return { kind: "image" }
}

function convertContent(content: MessageContent): TranscriptBlock[] {
  if (typeof content === "string") {
    return [{ kind: "text", text: content }]
  }
  return content.map(convertBlock)
}

function convertAssistant(message: AssistantMessage): TranscriptMessage {
  const blocks: TranscriptBlock[] = []
  for (const block of message.content) {
    if (block.type === "text") {
      blocks.push(convertBlock(block))
    } else if (block.type === "toolCall") {
      blocks.push({ kind: "call", name: block.name, arguments: JSON.stringify(block.arguments) })
    }
  }
  return { kind: "assistant", blocks }
}

function convertMessage(message: ConversationMessage): TranscriptMessage {
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

export function captureTranscript(context: TranscriptSource): TranscriptMessage[] {
  const transcript: TranscriptMessage[] = []
  for (const message of context.sessionManager.buildSessionProjection().messages) {
    if (message.role !== "system") {
      transcript.push(convertMessage(message))
    }
  }
  return transcript
}
