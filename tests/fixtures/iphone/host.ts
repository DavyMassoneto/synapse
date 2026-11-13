import { type ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { type PiIphoneHost, type PiIphoneShutdownHandler, type PiIphoneToolDefinition } from "#synapse/integration"
import { IPHONE_FIXTURE_TOOL_MISSING } from "./constants"

export class IphoneFixtureHost implements PiIphoneHost {
  private tool?: PiIphoneToolDefinition

  shutdownHandler?: PiIphoneShutdownHandler

  command?: Parameters<ExtensionAPI["registerCommand"]>[1]

  registerTool(tool: PiIphoneToolDefinition): void {
    this.tool = tool
  }

  registerCommand(_name: string, command: Parameters<ExtensionAPI["registerCommand"]>[1]): void {
    this.command = command
  }

  on(_event: "session_shutdown", handler: PiIphoneShutdownHandler): void {
    this.shutdownHandler = handler
  }

  requireTool(): PiIphoneToolDefinition {
    if (!this.tool) {
      throw new Error(IPHONE_FIXTURE_TOOL_MISSING)
    }
    return this.tool
  }
}
