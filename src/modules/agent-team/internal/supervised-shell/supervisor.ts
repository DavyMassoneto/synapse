import {
  SUPERVISED_SHELL_CLOSED,
  SUPERVISED_SHELL_STOP_FAILED,
  type SupervisedShellLauncher,
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellSpec,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { ShellAdmission } from "./admission"
import { SHELL_STOP_FAILED } from "./constants"
import { stopShellAdmission } from "./stop-admission"
import { type ShellStopOutcome } from "./types"

export class SupervisedShellSupervisor {
  private readonly launcher: SupervisedShellLauncher
  private readonly admissions = new Set<ShellAdmission>()
  private closed = false
  private epoch = 0
  private closing?: Promise<void>
  constructor(launcher: SupervisedShellLauncher) {
    this.launcher = launcher
  }

  async create(spec: SupervisedShellSpec, output: SupervisedShellOutput): Promise<SupervisedShellLease> {
    if (this.closed) {
      throw new Error(SUPERVISED_SHELL_CLOSED)
    }
    const admission = new ShellAdmission()
    const epoch = this.epoch
    this.admissions.add(admission)
    try {
      const lease = await this.launcher.create(spec, output)
      admission.publish(lease)
      if (this.closed || epoch !== this.epoch || admission.revoked) {
        await lease.terminate()
        throw new Error(SUPERVISED_SHELL_CLOSED)
      }
      return {
        id: lease.id,
        get state() {
          return lease.state
        },
        completion: lease.completion,
        release: admission.release.bind(admission),
        terminate: lease.terminate.bind(lease),
      }
    } finally {
      admission.finish()
    }
  }

  close(): Promise<void> {
    if (!this.closing) {
      this.closed = true
      this.closing = this.stop()
    }
    return this.closing
  }

  async stop(): Promise<void> {
    this.epoch++
    const attempts: Promise<ShellStopOutcome>[] = []
    for (const admission of this.admissions) {
      admission.revoked = true
      attempts.push(stopShellAdmission(admission))
    }
    const failures: Error[] = []
    for (const result of await Promise.all(attempts)) {
      if (result.kind === SHELL_STOP_FAILED) {
        failures.push(result.error)
      }
    }
    if (failures.length > 0) {
      throw new AggregateError(failures, SUPERVISED_SHELL_STOP_FAILED)
    }
  }
}
