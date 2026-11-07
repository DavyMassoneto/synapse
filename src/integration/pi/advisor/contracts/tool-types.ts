import type { AdvisorContext } from "./context-types";
import type { AdvisorRenderers } from "./rendering-types";
import type {
  AdvisorToolInput,
  AdvisorToolResult,
  AdvisorToolUpdate,
  PiAdvisorTool,
} from "./tool-base-types";

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
