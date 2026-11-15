import {
  SUPERVISED_SHELL_CLOSED,
  SUPERVISED_SHELL_STOP_FAILED,
  type SupervisedShellLauncher,
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellSpec,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { ShellAdmission } from "./admission"
import { createShellCancellation } from "./cancellation"
import { captureShellCleanup, finishShellCleanups } from "./cleanup"
import { AdmittedShellLease } from "./lease-facade"
import { type ShellCleanupOutcome } from "./types"

export class SupervisedShellSupervisor {
  private readonly launcher: SupervisedShellLauncher
  private readonly admissions = new Set<ShellAdmission>()
  private closed = false
  private epoch = 0
  private closing?: Promise<void>
  constructor(launcher: SupervisedShellLauncher) {
    this.launcher = launcher
  }

  async create(
    spec: SupervisedShellSpec,
    output: SupervisedShellOutput,
    signal?: AbortSignal,
  ): Promise<SupervisedShellLease> {
    if (this.closed) {
      throw new Error(SUPERVISED_SHELL_CLOSED)
    }
    const admission = new ShellAdmission(this.admissions)
    const cancellation = createShellCancellation(admission.cancellation.signal, signal)
    const epoch = this.epoch
    this.admissions.add(admission)
    try {
      const lease = await this.launcher.create(spec, output, cancellation, admission.publish.bind(admission))
      admission.publish(lease)
      if (this.closed || epoch !== this.epoch || admission.revoked) {
        await admission.terminate()
        throw new Error(SUPERVISED_SHELL_CLOSED)
      }
      return new AdmittedShellLease(lease, admission)
    } catch (failure) {
      await admission.creationFailed()
      throw failure
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
    const attempts: Promise<ShellCleanupOutcome>[] = []
    for (const admission of this.admissions) {
      admission.revoked = true
      attempts.push(captureShellCleanup(admission.stop.bind(admission)))
    }
    await finishShellCleanups(attempts, SUPERVISED_SHELL_STOP_FAILED)
  }
}
