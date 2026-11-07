import { ADVISOR_DIAGNOSTICS } from "@/modules/advisor/internal/diagnostics";
import { type TranscriptMessage } from "@/modules/advisor/public/transcript";

const CONTENT_LIMITS = [12_000, 4_000, 1_500, 500];
const HEAD_FRACTION = 0.6;
const SEPARATOR = "\n\n";

export function clip(text: string, limit: number): string {
  if (limit <= 0) {
    return "";
  }
  if (text.length <= limit) {
    return text;
  }

  const marker = ADVISOR_DIAGNOSTICS.clippedContent;
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
  let clipContent = false;
  if (message.kind === "toolResult") {
    const error = message.error ? " (error)" : "";
    label = `[tool_result ${message.tool}${error}]`;
    clipContent = true;
  } else if (message.kind === "shell") {
    label = `[user ran shell] $ ${message.command}`;
    clipContent = true;
  } else if (message.kind === "custom") {
    label = `[context:${message.customType}]`;
    clipContent = true;
  } else if (message.kind === "summary") {
    label = "[summary of earlier conversation]";
  }

  const parts = [label];
  for (const block of message.blocks) {
    if (block.kind === "image") {
      parts.push("[image omitted]");
    } else if (block.kind === "call") {
      parts.push(`[tool_call ${block.name}] ${clip(block.arguments, limit)}`);
    } else if (clipContent) {
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

  let blocks: string[] = [];
  for (const limit of CONTENT_LIMITS) {
    blocks = [];
    for (const message of messages) {
      const text = renderMessage(message, limit);
      if (text) {
        blocks.push(text);
      }
    }
    const full = blocks.join(SEPARATOR);
    if (full.length <= budget) {
      return full;
    }
  }

  const marker = ADVISOR_DIAGNOSTICS.omittedMessages;
  if (budget <= marker.length) {
    return clip(blocks[blocks.length - 1] ?? "", budget);
  }

  const firstBudget = Math.floor((budget - marker.length - SEPARATOR.length * 2) / 2);
  if (firstBudget <= 0) {
    return clip(blocks[0] ?? "", budget);
  }

  const first = clip(blocks[0], firstBudget);
  const selected: string[] = [];
  let remaining = budget - first.length - marker.length - SEPARATOR.length;

  for (let index = blocks.length - 1; index > 0; index--) {
    const available = remaining - SEPARATOR.length;
    if (available <= 0) {
      break;
    }

    const block = blocks[index];
    if (block.length > available) {
      if (selected.length === 0) {
        selected.unshift(clip(block, available));
      }
      break;
    }

    selected.unshift(block);
    remaining -= block.length + SEPARATOR.length;
  }

  return [first, marker, ...selected].join(SEPARATOR);
}
