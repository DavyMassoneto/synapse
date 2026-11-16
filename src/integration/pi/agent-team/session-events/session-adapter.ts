import { type MemberSession, type MemberSessionListener, type MemberUnsubscribe } from "#synapse/modules/agent-team"
import { type TeamMemberExtensionLifetime } from "../extension-lifecycle"
import { abortMemberSession } from "./abort-session"
import { PiTeamEventConnection } from "./event-connection"
import { type TeamMemberSessionPort } from "./types"

export class PiTeamSessionAdapter implements MemberSession {
  private readonly session: TeamMemberSessionPort

  private readonly lifetime: TeamMemberExtensionLifetime

  constructor(session: TeamMemberSessionPort, lifetime: TeamMemberExtensionLifetime) {
    this.session = session
    this.lifetime = lifetime
    this.abort = abortMemberSession.bind(undefined, session, lifetime)
  }

  isStreaming(): boolean {
    return this.session.isStreaming
  }

  async prompt(text: string): Promise<void> {
    this.lifetime.ensureHealthy()
    await this.session.prompt(text)
    this.lifetime.ensureHealthy()
  }

  async steer(text: string): Promise<void> {
    this.lifetime.ensureHealthy()
    await this.session.steer(text)
    this.lifetime.ensureHealthy()
  }

  readonly abort: MemberSession["abort"]

  async dispose(): Promise<void> {
    await this.lifetime.close()
  }

  subscribe(listener: MemberSessionListener): MemberUnsubscribe {
    const connection = new PiTeamEventConnection(this.session, listener, this.lifetime)
    return this.session.subscribe(connection.onEvent.bind(connection))
  }
}
