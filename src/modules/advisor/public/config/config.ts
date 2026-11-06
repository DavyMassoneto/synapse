import { type ThinkingLevel } from "@/modules/advisor/public/config";

export interface Config {
  model?: string;
  thinking: ThinkingLevel;
}
