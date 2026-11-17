import { type createWatchdogScenario } from "../scenario"

export type WatchdogScenario = ReturnType<typeof createWatchdogScenario>
export interface WatchdogFixtureOptions {
  shell: boolean
  failStop: boolean
}
