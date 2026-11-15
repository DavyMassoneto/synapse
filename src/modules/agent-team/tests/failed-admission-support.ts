import { prepareShellLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import {
  type SupervisedShellLauncher,
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellPreparedObserver,
  type SupervisedShellSpec,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { ShellLifecycleScenario } from "./shell-lifecycle-support"

export class FailedAdmissionLauncher implements SupervisedShellLauncher {
  readonly scenario = new ShellLifecycleScenario(false)
  beforeSpawn = false
  failedConfirmation = false
  pendingConfirmation = false
  failureMode = "protocol"
  async create(
    _spec: SupervisedShellSpec,
    _output: SupervisedShellOutput,
    _signal?: AbortSignal,
    prepared?: SupervisedShellPreparedObserver,
  ): Promise<SupervisedShellLease> {
    if (this.beforeSpawn) {
      throw new Error("before spawn")
    }
    this.scenario.synchronousClose = true
    this.scenario.confirmationFails = this.failedConfirmation
    this.scenario.confirmationPending = this.pendingConfirmation
    prepared?.(this.scenario.lease)
    const result = prepareShellLease(this.scenario.lease)
    if (this.failureMode === "ready") {
      this.scenario.status.emit("error", new Error("ready failed"))
    } else if (this.failureMode === "abort") {
      this.scenario.lease.terminate().catch(this.observeStop.bind(this))
    } else {
      this.scenario.status.write(Buffer.from([99]))
    }
    return result
  }
  private observeStop(): void {
    this.failedConfirmation = true
  }
}
