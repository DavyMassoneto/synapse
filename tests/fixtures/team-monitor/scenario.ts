import { expect } from "vitest"
import { TeamAgentHandlers } from "#synapse/integration/pi/agent-team"
import { type TeamAgentRow, type TeamKnownProgress } from "#synapse/modules/agent-team"
import { WATCHDOG_DEFAULT_OPTIONS, WATCHDOG_MEMBER, WatchdogFixture, waitForWatchdogCondition } from "../team-watchdog"
import { type WatchdogScenario } from "../team-watchdog-runner"
import { MONITOR_MEMBER_MISSING, MONITOR_OBSERVED, MONITOR_PROGRESS_MISSING } from "./constants"
import { MonitorProbe } from "./probe"
import { type MonitorScenarioBody } from "./types"

export function monitorMember(scenario: WatchdogScenario): TeamAgentRow {
  const row = scenario.team.overview().agents.find((agent) => agent.name === WATCHDOG_MEMBER)
  if (!row) {
    throw new Error(MONITOR_MEMBER_MISSING)
  }
  return row
}

export function monitorProgress(scenario: WatchdogScenario): TeamKnownProgress {
  const progress = monitorMember(scenario).progress
  if (progress?.kind !== MONITOR_OBSERVED) {
    throw new Error(MONITOR_PROGRESS_MISSING)
  }
  return progress
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
