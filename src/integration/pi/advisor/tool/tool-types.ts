import { type ToolDefinition } from "@earendil-works/pi-coding-agent";
import { type AdvisorRenderers } from "@/integration/pi/advisor/rendering";
import { type AdvisorContext } from "../context-types.ts";
import { type advisorParameters } from "./tool-schema.ts";

export interface AdvisorToolDetails {
  model?: string;
}

export type PiAdvisorTool = ToolDefinition<typeof advisorParameters, AdvisorToolDetails, object>;
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
export type AdvisorToolUpdate = Parameters<PiAdvisorTool["execute"]>[3];
export type AdvisorToolArguments = Parameters<PiAdvisorTool["execute"]>;
export type AdvisorToolResult = ReturnType<PiAdvisorTool["execute"]>;
export type AdvisorToolInput = AdvisorToolArguments[1];
