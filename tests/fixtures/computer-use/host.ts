import { type RegisteredCommand } from "@earendil-works/pi-coding-agent"
import { type PiComputerShutdown, type PiComputerToolDefinition } from "#synapse/integration"

export class ComputerIntegrationHost {
  tool?: PiComputerToolDefinition

  command?: Omit<RegisteredCommand, "name">

  shutdown?: PiComputerShutdown

  registerTool(tool: PiComputerToolDefinition): void {
    this.tool = tool
  }

  registerCommand(_name: string, command: Omit<RegisteredCommand, "name">): void {
    this.command = command
  }

  on(_event: "session_shutdown", handler: PiComputerShutdown): void {
    this.shutdown = handler
  }
}
