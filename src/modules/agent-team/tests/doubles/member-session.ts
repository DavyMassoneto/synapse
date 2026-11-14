import {
  type MemberSession,
  type MemberSessionEvent,
  type MemberSessionListener,
  type MemberUnsubscribe,
} from "#synapse/modules/agent-team"
import { TEAM_TEST_SUBSCRIPTION_FAILURE } from "../constants"
import { type TeamTestResolve } from "./types"

export class TeamTestSession implements MemberSession {
  failSubscribe = false

  streaming = false

  disposed = false

  disposals = 0

  prompts: string[] = []

  steers: string[] = []

  listener?: MemberSessionListener

  private resolve?: TeamTestResolve

  isStreaming(): boolean {
    return this.streaming
  }

  prompt(text: string): Promise<void> {
    this.prompts.push(text)
    return new Promise<void>(this.capture.bind(this))
  }

  steer(text: string): Promise<void> {
    this.steers.push(text)
    return Promise.resolve()
  }

  abort(): Promise<void> {
    this.streaming = false
    return Promise.resolve()
  }

  async dispose(): Promise<void> {
    this.disposals += 1
    this.disposed = true
  }

  subscribe(listener: MemberSessionListener): MemberUnsubscribe {
    if (this.failSubscribe) {
      throw new Error(TEAM_TEST_SUBSCRIPTION_FAILURE)
    }
    this.listener = listener
    return this.unsubscribe.bind(this)
  }

  emit(event: MemberSessionEvent): void {
    if (this.listener) {
      this.listener(event)
    }
  }

  finishPrompt(): void {
    if (this.resolve) {
      this.resolve()
    }
  }

  private capture(resolve: TeamTestResolve): void {
    this.resolve = resolve
  }

  private unsubscribe(): void {
    delete this.listener
  }
}
