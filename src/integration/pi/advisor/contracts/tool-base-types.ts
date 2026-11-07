import type { ToolDefinition } from "@earendil-works/pi-coding-agent";
import type { advisorParameters } from "../schema";

export interface AdvisorToolDetails {
  model?: string;
}

export type PiAdvisorTool = ToolDefinition<typeof advisorParameters, AdvisorToolDetails, object>;

export type AdvisorToolUpdate = Parameters<PiAdvisorTool["execute"]>[3];

export type AdvisorToolResult = ReturnType<PiAdvisorTool["execute"]>;

export type AdvisorToolOutput = Awaited<AdvisorToolResult>;

export type AdvisorToolInput = Parameters<PiAdvisorTool["execute"]>[1];
