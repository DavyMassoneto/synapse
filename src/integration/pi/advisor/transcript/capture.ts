import { type AssistantMessage } from "@earendil-works/pi-ai"
import { type TranscriptBlock, type TranscriptMessage } from "#synapse/modules"
import { TEXT_CONTENT } from "../content-text"
import {
  ASSISTANT_ROLE,
  BRANCH_SUMMARY_ROLE,
  COMPACTION_SUMMARY_ROLE,
  CUSTOM_ROLE,
  SHELL_ROLE,
  SYSTEM_ROLE,
  TOOL_CALL_CONTENT,
  TOOL_RESULT_ROLE,
  USER_ROLE,
} from "./constants"
import { type ContentBlock, type ConversationMessage, type MessageContent, type TranscriptSource } from "./types"

function convertBlock(block: ContentBlock): TranscriptBlock {
  if (block.type === TEXT_CONTENT) {
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
    if (block.type === TEXT_CONTENT) {
      blocks.push(convertBlock(block))
    } else if (block.type === TOOL_CALL_CONTENT) {
      blocks.push({ kind: "call", name: block.name, arguments: JSON.stringify(block.arguments) })
    }
  }
  return { kind: "assistant", blocks }
}

function convertMessage(message: ConversationMessage): TranscriptMessage {
  switch (message.role) {
    case USER_ROLE:
      return { kind: "user", blocks: convertContent(message.content) }
    case ASSISTANT_ROLE:
      return convertAssistant(message)
    case TOOL_RESULT_ROLE:
      return {
        kind: "toolResult",
        tool: message.toolName,
        error: message.isError,
        blocks: convertContent(message.content),
      }
    case SHELL_ROLE:
      return {
        kind: "shell",
        command: message.command,
        hidden: message.excludeFromContext === true,
        blocks: [{ kind: "text", text: message.output }],
      }
    case CUSTOM_ROLE:
      return {
        kind: "custom",
        customType: message.customType,
        blocks: convertContent(message.content),
      }
    case BRANCH_SUMMARY_ROLE:
    case COMPACTION_SUMMARY_ROLE:
      return { kind: "summary", blocks: [{ kind: "text", text: message.summary }] }
  }
}

export function captureTranscript(context: TranscriptSource): TranscriptMessage[] {
  const transcript: TranscriptMessage[] = []
  for (const message of context.sessionManager.buildSessionProjection().messages) {
    if (message.role !== SYSTEM_ROLE) {
      transcript.push(convertMessage(message))
    }
  }
  return transcript
}
