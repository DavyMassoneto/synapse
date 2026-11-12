import { type SessionEntry } from "@earendil-works/pi-coding-agent"
import { type TeamHistorySessionManager } from "#synapse/integration"

export class TeamHistoryTestSession implements TeamHistorySessionManager {
  private readonly entries: SessionEntry[]

  constructor(entries: SessionEntry[]) {
    this.entries = entries
  }

  getBranch(): SessionEntry[] {
    return this.entries
  }
}
