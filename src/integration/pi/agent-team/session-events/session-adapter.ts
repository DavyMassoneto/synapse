import { type MemberSession, type MemberSessionListener, type MemberUnsubscribe } from "#synapse/modules"
import { PiTeamEventConnection } from "./event-connection"
import { type TeamMemberSessionPort } from "./types"

export class PiTeamSessionAdapter implements MemberSession {
  private readonly session: TeamMemberSessionPort

  constructor(session: TeamMemberSessionPort) {
    this.session = session
  }

  isStreaming(): boolean {
    return this.session.isStreaming
  }

  async prompt(text: string): Promise<void> {
    await this.session.prompt(text)
  }

  async steer(text: string): Promise<void> {
    await this.session.steer(text)
  }

  async abort(): Promise<void> {
    await this.session.abort()
  }

  dispose(): void {
    this.session.dispose()
  }

  subscribe(listener: MemberSessionListener): MemberUnsubscribe {
    const connection = new PiTeamEventConnection(this.session, listener)
    return this.session.subscribe(connection.onEvent.bind(connection))
  }
}
