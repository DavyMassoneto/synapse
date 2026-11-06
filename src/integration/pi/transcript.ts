import type { AgentMessage } from "@earendil-works/pi-agent-core";
import type { ImageContent, TextContent } from "@earendil-works/pi-ai";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { TranscriptMessage } from "@/modules";

function renderContent(content: string | (TextContent | ImageContent)[]): string {
  if (typeof content === "string") {
    return content;
  }

  return content
    .map((block) => (block.type === "text" ? block.text : "[image omitted]"))
    .join("\n");
}

function convertMessage(message: AgentMessage): TranscriptMessage | undefined {
  switch (message.role) {
    case "user":
      return {
        role: message.role,
        parts: [{ text: `[user]\n${renderContent(message.content)}`, clip: false }],
      };
    case "assistant": {
      const parts = message.content.flatMap((block) => {
        if (block.type === "text") {
          return [{ text: block.text, clip: false }];
        }
        if (block.type === "toolCall") {
          return [
            {
              text: `[tool_call ${block.name}] ${JSON.stringify(block.arguments)}`,
              clip: true,
            },
          ];
        }
        return [];
      });
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
    messages = context.sessionManager
      .buildContextEntries()
      .filter((entry) => entry.type === "message")
      .map((entry) => entry.message);
  }

  return messages.map(convertMessage).filter((message) => message !== undefined);
}
