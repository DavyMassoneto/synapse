import { type AgentTeamLeadHost } from "#synapse/integration"
import { type TeamRecordedEntry, type TeamRecordedNotice } from "./types"

export class TeamLeadHost implements AgentTeamLeadHost {
  readonly notices: TeamRecordedNotice[] = []

  readonly entries: TeamRecordedEntry[] = []

  sendMessage(...args: Parameters<AgentTeamLeadHost["sendMessage"]>): void {
    this.notices.push(args)
  }

  appendEntry(...args: Parameters<AgentTeamLeadHost["appendEntry"]>): void {
    this.entries.push(args)
  }
}
