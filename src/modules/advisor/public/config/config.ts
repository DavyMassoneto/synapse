import type { ThinkingLevel } from "./types.ts";

export interface Config {
  model?: string;
  thinking: ThinkingLevel;
}
