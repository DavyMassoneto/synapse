import { TEAM_LEAD_NAME } from "#synapse/modules/agent-team/public/contracts"
import { type TeamRoster } from "../roster"
import { type TeamDirectory } from "../task-board"

export class TeamBoardDirectory implements TeamDirectory {
  private readonly roster: TeamRoster

  constructor(roster: TeamRoster) {
    this.roster = roster
  }

  isLead(name: string): boolean {
    return name === TEAM_LEAD_NAME
  }

  hasAgent(name: string): boolean {
    return this.isLead(name) || this.roster.has(name)
  }
}
