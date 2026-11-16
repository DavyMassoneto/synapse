import { type SupervisedShellService } from "#synapse/modules/agent-team"
import { captureShellCleanup, finishShellCleanups } from "../shell-cleanup"
import { TEAM_MEMBER_CLOSE_FAILURE } from "./constants"
import { type TeamMemberExtensionLifetime } from "./types"

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
    const shell = captureShellCleanup(this.shell.close.bind(this.shell))
    const session = captureShellCleanup(this.lifetime.close.bind(this.lifetime))
    await finishShellCleanups([shell, session], TEAM_MEMBER_CLOSE_FAILURE)
  }
}
