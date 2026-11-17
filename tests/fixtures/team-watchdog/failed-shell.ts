import { type SupervisedShellService } from "#synapse/modules/agent-team"
import { WATCHDOG_STOP_FAILURE } from "./constants"

export class WatchdogUnconfirmedShell implements SupervisedShellService {
  readonly create: SupervisedShellService["create"]

  readonly close: SupervisedShellService["close"]

  fail = true

  constructor(shell: SupervisedShellService) {
    this.create = shell.create.bind(shell)
    this.close = shell.close.bind(shell)
  }

  async stop(): Promise<void> {
    if (this.fail) {
      throw new Error(WATCHDOG_STOP_FAILURE)
    }
  }
}
