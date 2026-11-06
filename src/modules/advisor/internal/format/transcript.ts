import { type TranscriptMessage } from "@/modules/advisor/public/transcript";

const TOOL_RESULT_LIMIT = 12_000;
const HEAD_FRACTION = 0.6;
const SEPARATOR = "\n\n";

export function clip(text: string, limit: number): string {
  if (limit <= 0) {
    return "";
  }
  if (text.length <= limit) {
    return text;
  }

  const marker = "\n[... conteúdo omitido ...]\n";
  if (limit <= marker.length) {
    return text.slice(0, limit);
  }

  const available = limit - marker.length;
  const head = Math.floor(available * HEAD_FRACTION);
  const tail = available - head;
  return text.slice(0, head) + marker + text.slice(-tail);
}

function renderMessage(message: TranscriptMessage, limit: number): string {
  if (message.kind === "shell" && message.hidden) {
    return "";
  }

  let label = `[${message.kind}]`;
  if (message.kind === "toolResult") {
    label = `[tool_result ${message.name ?? ""}${message.error ? " (error)" : ""}]`;
  } else if (message.kind === "shell") {
    label = `[user ran shell] $ ${message.name ?? ""}`;
  } else if (message.kind === "custom") {
    label = `[context:${message.name ?? ""}]`;
  } else if (message.kind === "summary") {
    label = "[summary of earlier conversation]";
  }

  const parts = [label];
  for (const block of message.blocks) {
    if (block.kind === "image") {
      parts.push("[image omitted]");
    } else if (block.kind === "call") {
      parts.push(`[tool_call ${block.name}] ${clip(block.arguments, limit)}`);
    } else if (
      message.kind === "toolResult" ||
      message.kind === "shell" ||
      message.kind === "custom"
    ) {
      parts.push(clip(block.text, limit));
    } else {
      parts.push(block.text);
    }
  }
  return parts.join("\n");
}

export function buildTranscript(messages: TranscriptMessage[], budget: number): string {
  if (budget <= 0) {
    return "";
  }

  const blocks: string[] = [];
  for (const message of messages) {
    const text = renderMessage(message, TOOL_RESULT_LIMIT);
    if (text) {
      blocks.push(text);
    }
  }

  return clip(blocks.join(SEPARATOR), budget);
}
