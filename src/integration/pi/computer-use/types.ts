import { type ExtensionAPI, type ExtensionContext, type ToolDefinition } from "@earendil-works/pi-coding-agent"
import { type ComputerExecuteResult, type ComputerRenderedScreenshot } from "#synapse/modules"
import { type PI_COMPUTER_TOOL_NAME } from "./constants"
import { type PI_COMPUTER_PARAMETERS } from "./tool-schema"

export type PiComputerRegistry = Pick<ExtensionAPI, "registerCommand">

export interface PiComputerHost extends PiComputerRegistry {
  registerTool(tool: PiComputerToolDefinition): void
  on(event: "session_shutdown", handler: PiComputerShutdown): void
}

export type PiComputerShutdown = () => Promise<void>

export interface PiComputerToolContext {
  sessionManager: Pick<ExtensionContext["sessionManager"], "getSessionId">
  model?: ExtensionContext["model"]
}

export interface PiComputerToolDetails {
  result?: ComputerExecuteResult
  error?: string
}

export type PiComputerToolDefinition = Omit<
  ToolDefinition<typeof PI_COMPUTER_PARAMETERS, PiComputerToolDetails, never>,
  "name"
> &
  PiComputerToolIdentity

export interface PiComputerToolIdentity {
  name: typeof PI_COMPUTER_TOOL_NAME
}

export type PiComputerToolSignal = Parameters<PiComputerToolDefinition["execute"]>[2]

export type PiComputerToolUpdate = Parameters<PiComputerToolDefinition["execute"]>[3]

export type PiComputerToolOutput = Awaited<ReturnType<PiComputerToolDefinition["execute"]>>

export interface PiComputerCommandContext {
  ui: Pick<ExtensionContext["ui"], "notify">
}

export type PiComputerCaptureText = Omit<ComputerRenderedScreenshot, "image">
