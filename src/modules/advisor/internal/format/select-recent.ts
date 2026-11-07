import { clip } from "./clip";
import { SEPARATOR } from "./limits";

export function selectRecent(blocks: string[], budget: number): string[] {
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
