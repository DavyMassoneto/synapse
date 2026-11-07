import { clip } from "./clip";
import { SEPARATOR } from "./limits";
import { selectRecent } from "./select-recent";
import { OMITTED_MESSAGES } from "./transcript-text";

export function selectMessages(blocks: string[], budget: number): string {
  const marker = OMITTED_MESSAGES;
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
