import { type RegisteredCommand } from "@earendil-works/pi-coding-agent"
import { type AdvisorContext } from "../host"
import { type AdvisorToolActivation } from "../lifecycle"

export interface DisableCommand {
  kind: "disable"
}

export interface ThinkingCommand {
  kind: "thinking"
  level: string
}

export interface SelectCommand {
  kind: "select"
  query: string
}

export type AdvisorCommandInput = DisableCommand | ThinkingCommand | SelectCommand

export type AdvisorCommandBase = Pick<RegisteredCommand, "description" | "getArgumentCompletions">

export interface AdvisorCommandDefinition extends AdvisorCommandBase {
  handler(args: string, context: AdvisorContext): Promise<void>
}

export interface CommandRegistry {
  registerCommand(name: string, command: AdvisorCommandDefinition): void
}

export interface CommandHost extends CommandRegistry, AdvisorToolActivation {}
