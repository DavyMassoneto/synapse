import type { AgentMessage } from "@earendil-works/pi-agent-core";
import type { TranscriptMessage } from "#synapse/modules";
import { convertAssistant } from "./assistant";
import { convertContent } from "./content";

export function convertMessage(message: AgentMessage): TranscriptMessage | undefined {
  switch (message.role) {
    case "user":
      return { kind: "user", blocks: convertContent(message.content) };
    case "assistant":
      return convertAssistant(message);
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
