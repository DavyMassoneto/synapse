import { type RegisteredCommand } from "@earendil-works/pi-coding-agent"
import { type LifecycleHost, type SessionContext } from "../lifecycle"
import { type PickerContext } from "../model-picker"

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

export type CommandContext = PickerContext & SessionContext

export type AdvisorCommandBase = Pick<RegisteredCommand, "description" | "getArgumentCompletions">

export interface AdvisorCommandDefinition extends AdvisorCommandBase {
  handler(args: string, context: CommandContext): Promise<void>
}

export interface CommandRegistry {
  registerCommand(name: string, command: AdvisorCommandDefinition): void
}

export type CommandHost = CommandRegistry & LifecycleHost
