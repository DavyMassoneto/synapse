import { type ShellCleanupOutcome } from "#synapse/integration/pi/agent-team"
import { type createWatchdogScenario, type WatchdogFixture } from "../team-watchdog"

export type WatchdogScenario = ReturnType<typeof createWatchdogScenario>
export interface WatchdogCloseVerification {
  verify(result: ShellCleanupOutcome): void
}
export type WatchdogCloseScenarioBody = (
  scenario: WatchdogScenario,
  fixture: WatchdogFixture,
) => WatchdogCloseVerification
export type WatchdogScenarioBody = (scenario: WatchdogScenario) => Promise<void>
