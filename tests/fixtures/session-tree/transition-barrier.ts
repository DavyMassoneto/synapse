import { type AgentTeam } from "#synapse/modules/agent-team"

export class TreeTransitionBarrier {
  private readonly suspended = Promise.withResolvers<void>()
  private readonly released = Promise.withResolvers<void>()
  private readonly suspendTeam: AgentTeam["suspend"]
  private pending = true

  readonly entered = this.suspended.promise
  readonly release = this.released.resolve

  constructor(team: AgentTeam) {
    this.suspendTeam = team.suspend.bind(team)
    team.suspend = this.suspend.bind(this)
  }

  private async suspend(): Promise<void> {
    const blocked = this.pending
    this.pending = false
    await this.suspendTeam()
    if (blocked) {
      this.suspended.resolve()
      await this.released.promise
    }
  }
}
