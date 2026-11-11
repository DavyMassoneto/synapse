import {
  type AdvisorToolBase,
  type AdvisorToolInput,
  type AdvisorToolResult,
  type AdvisorToolSignal,
  type AdvisorToolUpdate,
  type ToolContext,
} from "../tool"
import { type AdvisorRenderers } from "../tool-rendering"

export interface AdvisorTool extends AdvisorToolBase, AdvisorRenderers {
  execute(
    id: string,
    input: AdvisorToolInput,
    signal: AdvisorToolSignal,
    update: AdvisorToolUpdate,
    context: ToolContext,
  ): AdvisorToolResult
}

export interface ToolRegistry {
  registerTool(tool: AdvisorTool): void
}
