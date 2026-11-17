import { createPiTeamLeadSession } from "#synapse/integration/pi/agent-team"
import { createAgentTeam } from "#synapse/modules/agent-team"
import { TeamLeadHost } from "../agent-team"
import { WatchdogClock } from "./clock"
import { WATCHDOG_TIME } from "./constants"
import { WatchdogObservation } from "./observation"
import { WatchdogSessions } from "./sessions"

function displayTime(): string {
  return WATCHDOG_TIME
}

export function createWatchdogScenario(directory: string) {
  const host = new TeamLeadHost()
  const lead = createPiTeamLeadSession(host)
  const sessions = new WatchdogSessions(directory)
  const clock = new WatchdogClock()
  const team = createAgentTeam(lead, sessions, displayTime, clock)
  const observation = new WatchdogObservation(clock, host, sessions.sessions)
  return { team, host, sessions, clock, observation }
}
