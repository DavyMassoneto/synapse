import { type AgentSession, type ExtensionError } from "@earendil-works/pi-coding-agent"
import { type TeamMemberExtensionSession } from "#synapse/integration/pi/agent-team/extension-lifecycle"
import {
  TEAM_EXTENSION_FIXTURE_DISPOSE,
  TEAM_EXTENSION_FIXTURE_EVENT,
  TEAM_EXTENSION_FIXTURE_FAILURE,
  TEAM_EXTENSION_FIXTURE_PATH,
  TEAM_EXTENSION_FIXTURE_SHUTDOWN,
  TEAM_EXTENSION_FIXTURE_START,
} from "./constants"
import { type TeamExtensionShutdownRelease } from "./types"

export class TeamExtensionSessionDouble implements TeamMemberExtensionSession {
  readonly operations: string[] = []

  readonly extensionRunner = this

  private release?: TeamExtensionShutdownRelease

  private readonly shutdownFinished = new Promise<void>(this.captureRelease.bind(this))

  held = false

  startupFailure = false

  shutdownFailure = false

  private errorListener?: Parameters<AgentSession["bindExtensions"]>[0]["onError"]

  async bindExtensions(bindings: Parameters<AgentSession["bindExtensions"]>[0]): Promise<void> {
    this.operations.push(TEAM_EXTENSION_FIXTURE_START)
    this.errorListener = bindings.onError
    if (this.startupFailure) {
      this.reportFailure()
    }
  }

  async emit(_event: Parameters<AgentSession["extensionRunner"]["emit"]>[0]): Promise<void> {
    this.operations.push(TEAM_EXTENSION_FIXTURE_SHUTDOWN)
    if (this.held) {
      await this.shutdownFinished
    }
    if (this.shutdownFailure) {
      this.reportFailure()
    }
  }

  dispose(): void {
    this.operations.push(TEAM_EXTENSION_FIXTURE_DISPOSE)
  }

  finishShutdown(): void {
    this.release?.()
  }

  private captureRelease(resolve: TeamExtensionShutdownRelease): void {
    this.release = resolve
  }

  reportFailure(): void {
    const error: ExtensionError = {
      extensionPath: TEAM_EXTENSION_FIXTURE_PATH,
      event: TEAM_EXTENSION_FIXTURE_EVENT,
      error: TEAM_EXTENSION_FIXTURE_FAILURE,
    }
    this.errorListener?.(error)
  }
}
