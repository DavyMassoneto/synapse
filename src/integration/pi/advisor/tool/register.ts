import type { Advisor } from "#synapse/modules";
import { ADVISOR_EXECUTION_MODE, ADVISOR_LABEL, ADVISOR_NAME } from "../constants";
import type { AdvisorHost } from "../contracts";
import { ADVISOR_TOOL_DESCRIPTION, ADVISOR_TOOL_SNIPPET } from "../presentation";
import { renderAdvisorCall, renderAdvisorResult } from "../rendering";
import { advisorParameters } from "../schema";
import { AdvisorToolHandler } from "./tool";

export function registerTool(pi: AdvisorHost, advisor: Advisor, lifetime: AbortSignal): void {
  const handler = new AdvisorToolHandler(advisor, lifetime);
  pi.registerTool({
    name: ADVISOR_NAME,
    label: ADVISOR_LABEL,
    executionMode: ADVISOR_EXECUTION_MODE,
    parameters: advisorParameters,
    description: ADVISOR_TOOL_DESCRIPTION,
    promptSnippet: ADVISOR_TOOL_SNIPPET,
    renderCall: renderAdvisorCall,
    renderResult: renderAdvisorResult,
    execute: handler.execute.bind(handler),
  });
}
