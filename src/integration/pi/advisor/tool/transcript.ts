import { type AgentMessage } from "@earendil-works/pi-agent-core";
import { type ImageContent, type TextContent } from "@earendil-works/pi-ai";
import { type AdvisorContext } from "#synapse/integration/pi/advisor/contracts";
import { type TranscriptBlock, type TranscriptMessage } from "#synapse/modules";

function convertContent(content: string | (TextContent | ImageContent)[]): TranscriptBlock[] {
  if (typeof content === "string") {
    return [{ kind: "text", text: content }];
  }

  const blocks: TranscriptBlock[] = [];
  for (const block of content) {
    if (block.type === "text") {
      blocks.push({ kind: "text", text: block.text });
    } else {
      blocks.push({ kind: "image" });
    }
  }
  return blocks;
}

function convertMessage(message: AgentMessage): TranscriptMessage | undefined {
  switch (message.role) {
    case "user":
      return { kind: "user", blocks: convertContent(message.content) };
    case "assistant": {
      const blocks: TranscriptBlock[] = [];
      for (const block of message.content) {
        if (block.type === "text") {
          blocks.push({ kind: "text", text: block.text });
        } else if (block.type === "toolCall") {
          blocks.push({
            kind: "call",
            name: block.name,
            arguments: JSON.stringify(block.arguments),
          });
        }
      }
      return { kind: "assistant", blocks };
    }
    case "toolResult":
      return {
        kind: "toolResult",
        tool: message.toolName,
        error: message.isError,
        blocks: convertContent(message.content),
      };
    case "bashExecution":
      return {
        kind: "shell",
        command: message.command,
        hidden: message.excludeFromContext === true,
        blocks: [{ kind: "text", text: message.output }],
      };
    case "custom":
      return {
        kind: "custom",
        customType: message.customType,
        blocks: convertContent(message.content),
      };
    case "branchSummary":
    case "compactionSummary":
      return { kind: "summary", blocks: [{ kind: "text", text: message.summary }] };
    default:
      return undefined;
  }
}

export function captureTranscript(context: AdvisorContext): TranscriptMessage[] {
  const messages = context.sessionManager.buildSessionProjection().messages;
  const transcript: TranscriptMessage[] = [];

  for (const message of messages) {
    const converted = convertMessage(message);
    if (converted !== undefined) {
      transcript.push(converted);
    }
  }
  return transcript;
}
