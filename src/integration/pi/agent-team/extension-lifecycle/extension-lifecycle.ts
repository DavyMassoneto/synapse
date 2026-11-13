import { type ExtensionError } from "@earendil-works/pi-coding-agent"
import {
  TEAM_PI_MEMBER_EXTENSION_FAILURE,
  TEAM_PI_MEMBER_SHUTDOWN_EVENT,
  TEAM_PI_MEMBER_SHUTDOWN_REASON,
} from "./constants"
import { type TeamMemberExtensionSession } from "./types"

export class TeamMemberExtensionLifecycle {
  private readonly session: TeamMemberExtensionSession

  private failure?: Error

  private closing?: Promise<void>

  constructor(session: TeamMemberExtensionSession) {
    this.session = session
  }

  async start(modelFallbackMessage?: string): Promise<void> {
    try {
      if (modelFallbackMessage) {
        throw new Error(modelFallbackMessage)
      }
      await this.session.bindExtensions({ onError: this.recordFailure.bind(this) })
      this.ensureHealthy()
    } catch (error) {
      try {
        await this.close()
      } catch (cleanupError) {
        throw new AggregateError([error, cleanupError], TEAM_PI_MEMBER_EXTENSION_FAILURE)
      }
      throw error
    }
  }

  ensureHealthy(): void {
    if (this.failure) {
      throw this.failure
    }
  }

  close(): Promise<void> {
    if (!this.closing) {
      this.closing = this.shutdown()
    }
    return this.closing
  }

  private async shutdown(): Promise<void> {
    const previousFailure = this.failure
    try {
      await this.session.extensionRunner.emit({
        type: TEAM_PI_MEMBER_SHUTDOWN_EVENT,
        reason: TEAM_PI_MEMBER_SHUTDOWN_REASON,
      })
      if (this.failure && this.failure !== previousFailure) {
        throw this.failure
      }
    } finally {
      this.session.dispose()
    }
  }

  private recordFailure(error: ExtensionError): void {
    this.failure = new Error(
      `${TEAM_PI_MEMBER_EXTENSION_FAILURE}${error.extensionPath}: ${error.event}: ${error.error}`,
    )
  }
}
