import { waitForWatchdogCondition } from "../team-watchdog"
import { type WatchdogScenario } from "../team-watchdog-runner"
import { MONITOR_FAILURE } from "./constants"
import { hasMonitorSettled } from "./predicates"

export async function failMonitorRestore(): Promise<never> {
  throw new Error(MONITOR_FAILURE)
}

export async function settleMonitorExecution(scenario: WatchdogScenario): Promise<void> {
  scenario.sessions.model.finish()
  await waitForWatchdogCondition(hasMonitorSettled.bind(undefined, scenario))
}
