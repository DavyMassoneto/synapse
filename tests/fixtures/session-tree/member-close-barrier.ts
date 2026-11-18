import { type MemberSession } from "#synapse/modules/agent-team"

export class TreeMemberCloseBarrier {
  private readonly enteredClose = Promise.withResolvers<void>()

  private readonly released = Promise.withResolvers<void>()

  private readonly disposeSession: MemberSession["dispose"]

  readonly entered = this.enteredClose.promise

  readonly release = this.released.resolve

  constructor(session: MemberSession) {
    this.disposeSession = session.dispose.bind(session)
    session.dispose = this.dispose.bind(this)
  }

  private async dispose(): Promise<void> {
    this.enteredClose.resolve()
    await this.released.promise
    await this.disposeSession()
  }
}
