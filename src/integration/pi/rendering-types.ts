import { type ToolDefinition } from "@earendil-works/pi-coding-agent";
import { type advisorParameters } from "@/integration";

export interface AdvisorToolDetails {
  model?: string;
}

export type AdvisorTool = ToolDefinition<typeof advisorParameters, AdvisorToolDetails, object>;
export type AdvisorRenderers = Pick<AdvisorTool, "renderCall" | "renderResult">;
export type AdvisorToolArguments = Parameters<AdvisorTool["execute"]>;
export type AdvisorToolResult = ReturnType<AdvisorTool["execute"]>;
export type AdvisorRenderCallArguments = Parameters<NonNullable<AdvisorTool["renderCall"]>>;
export type AdvisorRenderCallResult = ReturnType<NonNullable<AdvisorTool["renderCall"]>>;
export type AdvisorRenderResultArguments = Parameters<NonNullable<AdvisorTool["renderResult"]>>;
export type AdvisorRenderResultResult = ReturnType<NonNullable<AdvisorTool["renderResult"]>>;
export type AdvisorToolCallId = AdvisorToolArguments[0];
export type AdvisorToolInput = AdvisorToolArguments[1];
export type AdvisorToolSignal = AdvisorToolArguments[2];
export type AdvisorToolUpdate = AdvisorToolArguments[3];
export type AdvisorToolContext = AdvisorToolArguments[4];
export type AdvisorRenderCallInput = AdvisorRenderCallArguments[0];
export type AdvisorRenderCallTheme = AdvisorRenderCallArguments[1];
export type AdvisorRenderCallContext = AdvisorRenderCallArguments[2];
export type AdvisorRenderResultValue = AdvisorRenderResultArguments[0];
export type AdvisorRenderResultOptions = AdvisorRenderResultArguments[1];
export type AdvisorRenderResultTheme = AdvisorRenderResultArguments[2];
export type AdvisorRenderResultContext = AdvisorRenderResultArguments[3];
