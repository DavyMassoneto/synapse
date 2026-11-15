import { prepareShellLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import {
  type SupervisedShellLauncher,
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellPreparedObserver,
  type SupervisedShellSpec,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import {
  SHELL_ADMISSION_BEFORE_SPAWN,
  SHELL_ADMISSION_ERROR_EVENT,
  SHELL_ADMISSION_FAILURE_ABORT,
  SHELL_ADMISSION_FAILURE_PROTOCOL,
  SHELL_ADMISSION_FAILURE_READY,
  SHELL_ADMISSION_INVALID_FRAME,
  SHELL_ADMISSION_READY_FAILURE,
} from "./native-fixture-constants"
import { ShellLifecycleScenario } from "./shell-lifecycle-support"

export class FailedAdmissionLauncher implements SupervisedShellLauncher {
  readonly scenario = new ShellLifecycleScenario(false)
  beforeSpawn = false
  failedConfirmation = false
  pendingConfirmation = false
  failureMode = SHELL_ADMISSION_FAILURE_PROTOCOL
  async create(
    _spec: SupervisedShellSpec,
    _output: SupervisedShellOutput,
    _signal?: AbortSignal,
    prepared?: SupervisedShellPreparedObserver,
  ): Promise<SupervisedShellLease> {
    if (this.beforeSpawn) {
      throw new Error(SHELL_ADMISSION_BEFORE_SPAWN)
    }
    this.scenario.synchronousClose = true
    this.scenario.confirmationFails = this.failedConfirmation
    this.scenario.confirmationPending = this.pendingConfirmation
    prepared?.(this.scenario.lease)
    const result = prepareShellLease(this.scenario.lease)
    if (this.failureMode === SHELL_ADMISSION_FAILURE_READY) {
      this.scenario.status.emit(SHELL_ADMISSION_ERROR_EVENT, new Error(SHELL_ADMISSION_READY_FAILURE))
    } else if (this.failureMode === SHELL_ADMISSION_FAILURE_ABORT) {
      this.scenario.lease.terminate().catch(this.observeStop.bind(this))
    } else {
      this.scenario.status.write(Buffer.from([SHELL_ADMISSION_INVALID_FRAME]))
    }
    return result
  }
  private observeStop(): void {
    this.failedConfirmation = true
  }
}
