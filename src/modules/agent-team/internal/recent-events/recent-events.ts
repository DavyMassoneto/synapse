import { type TeamClock } from "#synapse/modules/agent-team/public/contracts"
import { TEAM_EVENT_LIMIT, TEAM_EVENT_TIME_SEPARATOR } from "./constants"

export class TeamRecentEvents {
  private events: string[] = []

  private readonly clock: TeamClock

  constructor(clock: TeamClock) {
    this.clock = clock
  }

  add(text: string): void {
    this.events.push(`${this.clock()}${TEAM_EVENT_TIME_SEPARATOR}${text}`)
    if (this.events.length > TEAM_EVENT_LIMIT) {
      this.events.shift()
    }
  }

  list(): string[] {
    return [...this.events]
  }

  clear(): void {
    this.events = []
  }
}
