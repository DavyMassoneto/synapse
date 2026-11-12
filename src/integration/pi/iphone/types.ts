import { type ExtensionAPI, type ToolDefinition } from "@earendil-works/pi-coding-agent"
import { type PI_IPHONE_PARAMETERS, type PI_IPHONE_TOOL_NAME, type PiIphoneDetails } from "./tool"

export type PiIphoneShutdownHandler = () => Promise<void>

export interface PiIphoneLifecycleHost {
  on(event: "session_shutdown", handler: PiIphoneShutdownHandler): void
}

export interface PiIphoneToolIdentity {
  name: typeof PI_IPHONE_TOOL_NAME
}

export type PiIphoneToolDefinition = Omit<ToolDefinition<typeof PI_IPHONE_PARAMETERS, PiIphoneDetails>, "name"> &
  PiIphoneToolIdentity

export interface PiIphoneToolHost {
  registerTool(tool: PiIphoneToolDefinition): void
}

export type PiIphoneHost = Pick<ExtensionAPI, "registerCommand"> & PiIphoneToolHost & PiIphoneLifecycleHost
