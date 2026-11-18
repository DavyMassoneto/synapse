import { type ToolDefinition } from "@earendil-works/pi-coding-agent"
import { type Static } from "typebox"
import { type WatchdogScenario } from "../team-watchdog-runner"
import { type MONITOR_TOOL_PARAMETERS } from "./schemas"

export interface MonitorToolControl {
  emit(): void
  finish(): void
}

export type MonitorScenarioBody = (scenario: WatchdogScenario, probe: MonitorToolControl) => Promise<void>

export type MonitorToolInput = Static<typeof MONITOR_TOOL_PARAMETERS>
export interface MonitorToolDetails {
  text: string
}
export type MonitorToolExecute = ToolDefinition<typeof MONITOR_TOOL_PARAMETERS, MonitorToolDetails>["execute"]
export type MonitorToolUpdate = Parameters<MonitorToolExecute>[3]
export type MonitorToolResult = Awaited<ReturnType<MonitorToolExecute>>
export type MonitorToolRelease = (result: MonitorToolResult) => void
