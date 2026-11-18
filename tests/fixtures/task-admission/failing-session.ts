import { type MemberSession } from "#synapse/modules/agent-team"
import { ADMISSION_CLOSE_FAILURE } from "./constants"

export class AdmissionFailingSession implements MemberSession {
  readonly closeFailure = new Error(ADMISSION_CLOSE_FAILURE)

  readonly isStreaming: MemberSession["isStreaming"]
  readonly prompt: MemberSession["prompt"]
  readonly steer: MemberSession["steer"]
  readonly abort: MemberSession["abort"]
  readonly subscribe: MemberSession["subscribe"]
  private readonly session: MemberSession

  constructor(session: MemberSession, failure?: Error) {
    if (failure) {
      this.closeFailure = failure
    }
    this.session = session
    this.isStreaming = session.isStreaming.bind(session)
    this.prompt = session.prompt.bind(session)
    this.steer = session.steer.bind(session)
    this.abort = session.abort.bind(session)
    this.subscribe = session.subscribe.bind(session)
  }

  async dispose(): Promise<void> {
    await this.session.dispose()
    throw this.closeFailure
  }
}
