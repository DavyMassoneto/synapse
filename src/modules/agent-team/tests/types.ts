import { type TaskBoard } from "../internal"
import { type AgentTeam, type TeamStartOutcome } from "../public"
import { type TaskTestJournal, type TeamTestLead, type TeamTestSessions } from "./doubles"

export interface TaskTestSut {
  board: TaskBoard
  journal: TaskTestJournal
}

export interface TeamTestSut {
  team: AgentTeam
  lead: TeamTestLead
  sessions: TeamTestSessions
}

export interface TeamGenerationSut extends TeamTestSut {
  previousResult: TeamStartOutcome
  current: Promise<TeamStartOutcome>
}
