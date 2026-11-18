import { expect } from "vitest"
import { TeamAgentHandlers } from "#synapse/integration/pi/agent-team"
import { type TeamAgentRow, type TeamKnownProgress } from "#synapse/modules/agent-team"
import { WATCHDOG_DEFAULT_OPTIONS, WATCHDOG_MEMBER, WatchdogFixture, waitForWatchdogCondition } from "../team-watchdog"
import { type WatchdogScenario } from "../team-watchdog-runner"
import { MonitorProbe } from "./probe"
import { type MonitorScenarioBody } from "./types"

export function monitorMember(scenario: WatchdogScenario): TeamAgentRow {
  const row = scenario.team.overview().agents.find((agent) => agent.name === WATCHDOG_MEMBER)
  if (!row) {
    throw new Error(WATCHDOG_MEMBER)
  }
  return row
}

export function monitorProgress(scenario: WatchdogScenario): TeamKnownProgress {
  const progress = monitorMember(scenario).progress
  if (progress?.kind !== "observed") {
    throw new Error(WATCHDOG_MEMBER)
  }
  return progress
}

export function hasMonitorTool(scenario: WatchdogScenario): boolean {
  return monitorProgress(scenario).tools.length === 1
}

export function hasMonitorStreamUpdate(scenario: WatchdogScenario): boolean {
  return monitorProgress(scenario).streamUpdates > 0
}

export function hasMonitorToolUpdate(scenario: WatchdogScenario): boolean {
  return monitorProgress(scenario).lastSignal === "tool-update"
}

export function hasMonitorNextTurn(scenario: WatchdogScenario): boolean {
  return scenario.sessions.model.streams === 2
}

export function hasMonitorSettled(scenario: WatchdogScenario): boolean {
  return monitorMember(scenario).status === "inactive"
}

export async function monitorList(scenario: WatchdogScenario): Promise<string> {
  const handler = new TeamAgentHandlers(scenario.team, WATCHDOG_MEMBER)
  const output = await handler.list()
  expect(output.isError).toBe(false)
  return output.details.text
}

export async function runMonitorScenario(body: MonitorScenarioBody): Promise<void> {
  const fixture = new WatchdogFixture()
  const probe = new MonitorProbe()
  try {
    const scenario = await fixture.start(WATCHDOG_DEFAULT_OPTIONS, [probe.install.bind(probe)])
    await waitForWatchdogCondition(scenario.observation.hasNewTimer.bind(scenario.observation))
    await body(scenario, probe)
  } finally {
    probe.finish()
    await fixture.close()
  }
}
