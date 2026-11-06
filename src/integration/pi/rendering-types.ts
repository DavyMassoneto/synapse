import type { ToolDefinition } from "@earendil-works/pi-coding-agent";
import type { advisorParameters } from "@/integration/pi/tool-schema.ts";
export type AdvisorTool = ToolDefinition<typeof advisorParameters, { model?: string }, object>;
export type AdvisorRenderers = Pick<AdvisorTool, "renderCall" | "renderResult">;
