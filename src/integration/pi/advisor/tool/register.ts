import { type Advisor } from "#synapse/modules/advisor/public"
import { renderAdvisorCall, renderAdvisorResult } from "../tool-rendering"
import {
  ADVISOR_EXECUTION_MODE,
  ADVISOR_LABEL,
  ADVISOR_NAME,
  ADVISOR_TOOL_DESCRIPTION,
  ADVISOR_TOOL_SNIPPET,
  advisorParameters,
} from "./constants"
import { AdvisorToolHandler } from "./tool"
import { type ToolRegistry } from "./types"

export function registerTool(pi: ToolRegistry, advisor: Advisor, lifetime: AbortSignal): void {
  const handler = new AdvisorToolHandler(advisor, lifetime)
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
  })
}
