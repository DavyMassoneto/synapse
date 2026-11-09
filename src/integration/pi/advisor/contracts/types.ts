import {
  type AgentToolResult,
  type BeforeAgentStartEvent,
  type BeforeAgentStartEventResult,
  type ExtensionAPI,
  type ExtensionContext,
  type ExtensionUIContext,
  type ModelRegistry,
  type RegisteredCommand,
  type SessionShutdownEvent,
  type SessionStartEvent,
  type Theme,
  type ToolDefinition,
  type ToolRenderResultOptions,
  type ToolResultEvent,
  type ToolResultEventResult,
  type TurnEndEvent,
  type TurnEndEventResult,
} from "@earendil-works/pi-coding-agent"
import { type Component } from "@earendil-works/pi-tui"
import { type advisorParameters } from "../schema"

export type AdvisorUI = Pick<ExtensionUIContext, "notify" | "select" | "setStatus">

export type AdvisorRegistry = Pick<ModelRegistry, "getAvailable" | "find" | "hasConfiguredAuth" | "streamSimple">

export type AdvisorModelRegistry = Pick<AdvisorRegistry, "find" | "hasConfiguredAuth" | "streamSimple">

export type AdvisorSession = Pick<ExtensionContext["sessionManager"], "buildSessionProjection">

export type AdvisorContextBase = Pick<ExtensionContext, "hasUI" | "scopedModels" | "getSystemPrompt">

export interface AdvisorContext extends AdvisorContextBase {
  ui: AdvisorUI
  modelRegistry: AdvisorRegistry
  sessionManager: AdvisorSession
}

export type AdvisorCommandBase = Pick<RegisteredCommand, "description" | "getArgumentCompletions">

export interface AdvisorCommandDefinition extends AdvisorCommandBase {
  handler(args: string, context: AdvisorContext): Promise<void>
}

export type AdvisorHostBase = Pick<ExtensionAPI, "getActiveTools" | "setActiveTools">

export type Unsubscribe = () => void

export interface AdvisorHost extends AdvisorHostBase {
  registerTool(tool: AdvisorTool): void
  registerCommand(name: string, command: AdvisorCommandDefinition): void
  on(event: "session_start", handler: AdvisorSessionStartHandler): Unsubscribe
  on(event: "session_shutdown", handler: AdvisorShutdownHandler): Unsubscribe
  on(event: "before_agent_start", handler: AdvisorBeforeStartHandler): Unsubscribe
  on(event: "tool_result", handler: AdvisorToolResultHandler): Unsubscribe
  on(event: "turn_end", handler: AdvisorTurnEndHandler): Unsubscribe
}

export type AdvisorSessionStartHandler = (event: SessionStartEvent, context: AdvisorContext) => void | Promise<void>

export type AdvisorShutdownHandler = (event: SessionShutdownEvent, context: AdvisorContext) => void | Promise<void>

export type BeforeStartOutcome = BeforeAgentStartEventResult | undefined

export type AdvisorBeforeStartHandler = (
  event: BeforeAgentStartEvent,
  context: AdvisorContext,
) => BeforeStartOutcome | Promise<BeforeStartOutcome>

export type ToolResultOutcome = ToolResultEventResult | undefined

export type AdvisorToolResultHandler = (
  event: ToolResultEvent,
  context: AdvisorContext,
) => ToolResultOutcome | Promise<ToolResultOutcome>

export type TurnEndOutcome = TurnEndEventResult | undefined

export type AdvisorTurnEndHandler = (
  event: TurnEndEvent,
  context: AdvisorContext,
) => TurnEndOutcome | Promise<TurnEndOutcome>

export type AdvisorRenderTheme = Pick<Theme, "fg" | "bold">

export interface AdvisorRenderContext {
  lastComponent?: Component
  isError?: boolean
}

export interface AdvisorRenderers {
  renderCall(input: AdvisorToolInput, theme: AdvisorRenderTheme, context: AdvisorRenderContext): Component
  renderResult(
    result: AgentToolResult<AdvisorToolDetails>,
    options: ToolRenderResultOptions,
    theme: AdvisorRenderTheme,
    context: AdvisorRenderContext,
  ): Component
}

export interface AdvisorToolDetails {
  model?: string
}

export type AdvisorRenderState = Pick<AdvisorToolDetails, never>

export type PiAdvisorTool = ToolDefinition<typeof advisorParameters, AdvisorToolDetails, AdvisorRenderState>

export type AdvisorToolUpdate = Parameters<PiAdvisorTool["execute"]>[3]

export type AdvisorToolResult = ReturnType<PiAdvisorTool["execute"]>

export type AdvisorToolOutput = Awaited<AdvisorToolResult>

export type AdvisorToolInput = Parameters<PiAdvisorTool["execute"]>[1]

export type AdvisorExecutionMode = NonNullable<AdvisorTool["executionMode"]>

export type OptionalModel = string | undefined

export type AdvisorToolBase = Omit<PiAdvisorTool, "execute" | "renderCall" | "renderResult">

export type OptionalSignal = AbortSignal | undefined

export interface AdvisorTool extends AdvisorToolBase, AdvisorRenderers {
  execute(
    id: string,
    input: AdvisorToolInput,
    signal: OptionalSignal,
    update: AdvisorToolUpdate,
    context: AdvisorContext,
  ): AdvisorToolResult
}
