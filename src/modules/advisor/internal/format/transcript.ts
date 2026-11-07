import { ADVISOR_DIAGNOSTICS } from "#synapse/modules/advisor/internal/constants";
import type { TranscriptMessage } from "#synapse/modules/advisor/public";

import { CONTENT_LIMITS, HEAD_FRACTION, SEPARATOR } from "./limits.ts";

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

  return renderBlocks(message, limit, label, clipContent);
}

function renderBlocks(
  message: TranscriptMessage,
  limit: number,
  label: string,
  clipContent: boolean,
): string {
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

  return selectMessages(blocks, budget);
}

function selectMessages(blocks: string[], budget: number): string {
  const marker = ADVISOR_DIAGNOSTICS.omittedMessages;
  if (budget <= marker.length) {
    return clip(blocks[blocks.length - 1] ?? "", budget);
  }

  const firstBudget = Math.floor((budget - marker.length - SEPARATOR.length * 2) / 2);
  if (firstBudget <= 0) {
    return clip(blocks[0] ?? "", budget);
  }

  const first = clip(blocks[0], firstBudget);
  const remaining = budget - first.length - marker.length - SEPARATOR.length;
  const selected = selectRecent(blocks, remaining);
  return [first, marker, ...selected].join(SEPARATOR);
}

function selectRecent(blocks: string[], budget: number): string[] {
  let remaining = budget;
  const selected: string[] = [];

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

  return selected;
}
