import { type MemberTurnRuntime, type TeamClock } from "#synapse/modules/agent-team/public/contracts"
import { type ObservedTime } from "./types"

export function captureObservedTime(clock: TeamClock, runtime: MemberTurnRuntime): ObservedTime {
  return { timestamp: clock(), monotonic: runtime.monotonic() }
}
