import { type AdvisorContext } from "./context-types.ts";
import { type AdvisorRenderers } from "./rendering-types.ts";
import {
  type AdvisorToolInput,
  type AdvisorToolResult,
  type AdvisorToolUpdate,
  type PiAdvisorTool,
} from "./tool-base-types.ts";

export interface AdvisorTool
  extends Omit<PiAdvisorTool, "execute" | "renderCall" | "renderResult">,
    AdvisorRenderers {
  execute(
    id: string,
    input: AdvisorToolInput,
    signal: AbortSignal | undefined,
    update: AdvisorToolUpdate,
    context: AdvisorContext,
  ): AdvisorToolResult;
}
