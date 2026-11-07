import type { ToolDefinition } from "@earendil-works/pi-coding-agent";
import type { advisorParameters } from "./tool-schema.ts";

export interface AdvisorToolDetails {
  model?: string;
}
export type PiAdvisorTool = ToolDefinition<typeof advisorParameters, AdvisorToolDetails, object>;
export type AdvisorToolUpdate = Parameters<PiAdvisorTool["execute"]>[3];
export type AdvisorToolArguments = Parameters<PiAdvisorTool["execute"]>;
export type AdvisorToolResult = ReturnType<PiAdvisorTool["execute"]>;
export type AdvisorToolInput = AdvisorToolArguments[1];
