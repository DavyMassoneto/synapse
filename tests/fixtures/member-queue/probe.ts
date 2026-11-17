import { type MemberSession, type MemberSessionListener, type MemberUnsubscribe } from "#synapse/modules/agent-team"
import { type QueueEvents } from "./types"

export class QueueSessionProbe implements MemberSession {
  readonly events: QueueEvents = []

  readonly prompts: string[] = []

  private readonly session: MemberSession

  private listener?: MemberSessionListener

  executionId = 0

  steersResolved = 0

  constructor(session: MemberSession) {
    this.session = session
    this.isStreaming = session.isStreaming.bind(session)
    this.abort = session.abort.bind(session)
    this.dispose = session.dispose.bind(session)
  }

  readonly isStreaming: MemberSession["isStreaming"]

  async steer(text: string): Promise<void> {
    await this.session.steer(text)
    this.steersResolved++
  }

  readonly abort: MemberSession["abort"]

  readonly dispose: MemberSession["dispose"]

  prompt(text: string, executionId: number): Promise<void> {
    this.executionId = executionId
    this.prompts.push(text)
    return this.session.prompt(text, executionId)
  }

  subscribe(listener: MemberSessionListener): MemberUnsubscribe {
    this.listener = listener
    return this.session.subscribe(this.record.bind(this))
  }

  record(event: QueueEvents[number]): void {
    this.events.push(event)
    this.listener?.(event)
  }
}
