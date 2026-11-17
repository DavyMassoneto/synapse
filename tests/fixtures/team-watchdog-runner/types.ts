import { type createWatchdogScenario } from "../team-watchdog"

export type WatchdogScenario = ReturnType<typeof createWatchdogScenario>
export type WatchdogScenarioBody = (scenario: WatchdogScenario) => Promise<void>
