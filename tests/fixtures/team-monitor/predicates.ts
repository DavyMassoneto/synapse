import { TEAM_INACTIVE } from "#synapse/modules/agent-team"
import { type WatchdogScenario } from "../team-watchdog-runner"
import { MONITOR_SIGNAL_TOOL_UPDATE } from "./constants"
import { monitorMember, monitorProgress } from "./scenario"

export function hasMonitorTool(scenario: WatchdogScenario): boolean {
  return monitorProgress(scenario).tools.length === 1
}

export function hasMonitorStreamUpdate(scenario: WatchdogScenario): boolean {
  return monitorProgress(scenario).streamUpdates > 0
}

export function hasMonitorToolUpdate(scenario: WatchdogScenario): boolean {
  return monitorProgress(scenario).lastSignal === MONITOR_SIGNAL_TOOL_UPDATE
}

export function hasMonitorNextTurn(scenario: WatchdogScenario): boolean {
  return scenario.sessions.model.streams === 2
}

export function hasMonitorSettled(scenario: WatchdogScenario): boolean {
  return monitorMember(scenario).status === TEAM_INACTIVE
}
