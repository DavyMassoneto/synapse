import { captureShellCleanup } from "#synapse/integration/pi/agent-team"
import { type SupervisedShellService } from "#synapse/modules/agent-team"

export class WatchdogTrackedShell implements SupervisedShellService {
  readonly create: SupervisedShellService["create"]

  readonly stop: SupervisedShellService["stop"]

  private readonly shell: SupervisedShellService

  private closing?: Promise<void>

  confirmed = false

  realClosed = false

  failure?: Error

  injectedFailure?: Error

  constructor(shell: SupervisedShellService) {
    this.shell = shell
    this.create = shell.create.bind(shell)
    this.stop = shell.stop.bind(shell)
  }

  private async closeOwnedShell(): Promise<void> {
    await this.shell.close()
    this.realClosed = true
    if (this.injectedFailure) {
      throw this.injectedFailure
    }
  }

  close(): Promise<void> {
    if (!this.closing) {
      this.closing = this.confirmClose()
    }
    return this.closing
  }

  private async confirmClose(): Promise<void> {
    const result = await captureShellCleanup(this.closeOwnedShell.bind(this))
    if (result.failed) {
      this.confirmed = false
      this.failure = result.error
      throw result.error
    }
    this.confirmed = true
  }
}
