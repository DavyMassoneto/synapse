import type { TranscriptMessage } from "#synapse/modules/advisor/public/contracts";
import { clip } from "./clip";
import { IMAGE_OMITTED, TOOL_CALL_LABEL } from "./transcript-text";

export function renderBlocks(
  message: TranscriptMessage,
  limit: number,
  label: string,
  clipContent: boolean,
): string {
  const parts = [label];
  for (const block of message.blocks) {
    if (block.kind === "image") {
      parts.push(IMAGE_OMITTED);
    } else if (block.kind === "call") {
      parts.push(`[${TOOL_CALL_LABEL} ${block.name}] ${clip(block.arguments, limit)}`);
    } else if (clipContent) {
      parts.push(clip(block.text, limit));
    } else {
      parts.push(block.text);
    }
  }
  return parts.join("\n");
}
