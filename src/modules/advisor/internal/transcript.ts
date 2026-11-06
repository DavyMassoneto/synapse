import { type TranscriptMessage } from "@/modules";

const TOOL_RESULT_LIMIT = 12_000;

export function clip(text: string, limit: number): string {
  if (text.length <= limit) {
    return text;
  }

  const head = Math.floor(limit * 0.6);
  const omitted = text.length - limit;
  return (
    text.slice(0, head) +
    "\n[... " +
    omitted +
    " chars omitted ...]\n" +
    text.slice(-(limit - head))
  );
}

export function buildTranscript(messages: TranscriptMessage[], budget: number): string {
  let blocks: string[] = [];

  for (const limit of [TOOL_RESULT_LIMIT, 4_000, 1_500, 500]) {
    blocks = messages.map((message) =>
      message.parts.map((part) => (part.clip ? clip(part.text, limit) : part.text)).join("\n"),
    );

    if (blocks.join("\n\n").length <= budget) {
      return blocks.join("\n\n");
    }
  }

  const first = blocks[0] ?? "";
  const tail: string[] = [];
  let used = first.length + 200;

  for (let index = blocks.length - 1; index > 0; index--) {
    if (used + blocks[index].length + 2 > budget) {
      break;
    }

    tail.unshift(blocks[index]);
    used += blocks[index].length + 2;
  }

  const omitted = blocks.length - 1 - tail.length;
  return [
    first,
    `[... ${omitted} earlier messages omitted to fit the advisor context window ...]`,
    ...tail,
  ].join("\n\n");
}
