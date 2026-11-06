import { type AdvisorTool } from "@/integration";

export type AdvisorRenderers = Pick<AdvisorTool, "renderCall" | "renderResult">;
export type AdvisorRenderCallArguments = Parameters<NonNullable<AdvisorTool["renderCall"]>>;
export type AdvisorRenderResultArguments = Parameters<NonNullable<AdvisorTool["renderResult"]>>;
export type AdvisorRenderCallInput = AdvisorRenderCallArguments[0];
export type AdvisorRenderCallContext = AdvisorRenderCallArguments[2];
export type AdvisorRenderResultValue = AdvisorRenderResultArguments[0];
export type AdvisorRenderResultContext = AdvisorRenderResultArguments[3];
