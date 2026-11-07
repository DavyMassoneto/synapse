import type { ImageContent, TextContent } from "@earendil-works/pi-ai";
import type { TranscriptBlock } from "#synapse/modules";

export function convertContent(
  content: string | (TextContent | ImageContent)[],
): TranscriptBlock[] {
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
