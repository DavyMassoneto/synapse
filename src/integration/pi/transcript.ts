import { type AgentMessage } from "@earendil-works/pi-agent-core";
import { type ImageContent, type TextContent } from "@earendil-works/pi-ai";
import { type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { type TranscriptMessage, type TranscriptPart } from "@/modules";

function renderContent(content: string | (TextContent | ImageContent)[]): string {
  if (typeof content === "string") {
    return content;
  }

  const parts: string[] = [];
  for (const block of content) {
    parts.push(block.type === "text" ? block.text : "[image omitted]");
  }
  return parts.join("\n");
}

function convertMessage(message: AgentMessage): TranscriptMessage | undefined {
  switch (message.role) {
    case "user":
      return {
        role: message.role,
        parts: [{ text: `[user]\n${renderContent(message.content)}`, clip: false }],
      };
    case "assistant": {
      const parts: TranscriptPart[] = [];
      for (const block of message.content) {
        if (block.type === "text") {
          parts.push({ text: block.text, clip: false });
        } else if (block.type === "toolCall") {
          parts.push({
            text: `[tool_call ${block.name}] ${JSON.stringify(block.arguments)}`,
            clip: true,
          });
        }
      }
      return { role: message.role, parts: [{ text: "[assistant]", clip: false }, ...parts] };
    }
    case "toolResult":
      return {
        role: message.role,
        parts: [
          {
            text:
              "[tool_result " +
              message.toolName +
              (message.isError ? " (error)" : "") +
              "]\n" +
              renderContent(message.content),
            clip: true,
          },
        ],
      };
    case "bashExecution":
      if (message.excludeFromContext) {
        return undefined;
      }
      return {
        role: message.role,
        parts: [{ text: `[user ran shell] $ ${message.command}\n${message.output}`, clip: true }],
      };
    case "custom":
      return {
        role: message.role,
        parts: [
          {
            text: `[context:${message.customType}]\n${renderContent(message.content)}`,
            clip: true,
          },
        ],
      };
    case "branchSummary":
    case "compactionSummary":
      return {
        role: message.role,
        parts: [{ text: `[summary of earlier conversation]\n${message.summary}`, clip: false }],
      };
    default:
      return undefined;
  }
}

export function captureTranscript(context: ExtensionContext): TranscriptMessage[] {
  let messages: AgentMessage[];

  try {
    messages = context.sessionManager.buildSessionProjection().messages;
  } catch {
    messages = [];
    for (const entry of context.sessionManager.buildContextEntries()) {
      if (entry.type === "message") messages.push(entry.message);
    }
  }

  const transcript: TranscriptMessage[] = [];
  for (const message of messages) {
    const converted = convertMessage(message);
    if (converted !== undefined) transcript.push(converted);
  }
  return transcript;
}
