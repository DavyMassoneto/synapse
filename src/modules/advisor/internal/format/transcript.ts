import type { TranscriptMessage } from "#synapse/modules/advisor/public/contracts";
import { CONTENT_LIMITS, SEPARATOR } from "./limits";
import { renderMessage } from "./render-message";
import { selectMessages } from "./select-messages";

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
