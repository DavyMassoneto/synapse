import { type SupervisedShellService } from "#synapse/modules/agent-team/public/supervised-shell"
import { type TeamMemberExtensionLifetime } from "../extension-lifecycle"
import {
  SUPERVISED_BASH_CLOSE_FAILED,
  SUPERVISED_BASH_CLOSE_FAILURE,
  SUPERVISED_BASH_CLOSE_SUCCEEDED,
} from "./constants"
import { type SupervisedBashCloseOutcome } from "./types"

export class SupervisedMemberLifetime implements TeamMemberExtensionLifetime {
  private readonly lifetime: TeamMemberExtensionLifetime
  private readonly shell: SupervisedShellService
  private closing?: Promise<void>
  readonly stopShells: SupervisedShellService["stop"]
  readonly ensureHealthy: TeamMemberExtensionLifetime["ensureHealthy"]
  constructor(lifetime: TeamMemberExtensionLifetime, shell: SupervisedShellService) {
    this.lifetime = lifetime
    this.shell = shell
    this.stopShells = shell.stop.bind(shell)
    this.ensureHealthy = lifetime.ensureHealthy.bind(lifetime)
  }
  close(): Promise<void> {
    if (!this.closing) {
      this.closing = this.shutdown()
    }
    return this.closing
  }
  private async shutdown(): Promise<void> {
    const shell = this.closeShell()
    const session = this.closeSession()
    const failures: Error[] = []
    const results = await Promise.all([shell, session])
    for (const result of results) {
      if (result.kind === SUPERVISED_BASH_CLOSE_FAILED) {
        failures.push(result.error)
      }
    }
    if (failures.length > 0) {
      throw new AggregateError(failures, SUPERVISED_BASH_CLOSE_FAILURE)
    }
  }
  private async closeShell(): Promise<SupervisedBashCloseOutcome> {
    try {
      await this.shell.close()
      return { kind: SUPERVISED_BASH_CLOSE_SUCCEEDED }
    } catch (error) {
      if (error instanceof Error) {
        return { kind: SUPERVISED_BASH_CLOSE_FAILED, error }
      }
      throw error
    }
  }
  private async closeSession(): Promise<SupervisedBashCloseOutcome> {
    try {
      await this.lifetime.close()
      return { kind: SUPERVISED_BASH_CLOSE_SUCCEEDED }
    } catch (error) {
      if (error instanceof Error) {
        return { kind: SUPERVISED_BASH_CLOSE_FAILED, error }
      }
      throw error
    }
  }
}
