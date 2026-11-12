import { Team } from "../internal"
import { type AgentTeam, type MemberSessions, type TeamClock, type TeamLead } from "./contracts"

export function createAgentTeam(lead: TeamLead, sessions: MemberSessions, clock: TeamClock): AgentTeam {
  return new Team(lead, sessions, clock)
}
