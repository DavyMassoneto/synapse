import { createPiTeamLeadSession, piTeamClock } from "#synapse/integration/pi/agent-team"
import { createAgentTeam } from "#synapse/modules/agent-team"
import { TeamLeadHost } from "../agent-team"
import { WatchdogClock } from "./clock"
import { WatchdogObservation } from "./observation"
import { WatchdogSessions } from "./sessions"

export function createWatchdogScenario(directory: string) {
  const host = new TeamLeadHost()
  const lead = createPiTeamLeadSession(host)
  const sessions = new WatchdogSessions(directory)
  const clock = new WatchdogClock()
  const team = createAgentTeam(lead, sessions, piTeamClock, clock)
  const observation = new WatchdogObservation(clock, host, sessions.sessions)
  return { team, host, sessions, clock, observation, directory }
}
