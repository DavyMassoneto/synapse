import { Team } from "../internal"
import { type AgentTeam, type MemberSessions, type MemberTurnRuntime, type TeamClock, type TeamLead } from "./contracts"

export function createAgentTeam(
  lead: TeamLead,
  sessions: MemberSessions,
  clock: TeamClock,
  runtime?: MemberTurnRuntime,
): AgentTeam {
  return new Team(lead, sessions, clock, runtime)
}
