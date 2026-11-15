import {
  type SupervisedShellLease,
  type SupervisedShellLeaseState,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { type ShellAdmission } from "./admission"

export class AdmittedShellLease implements SupervisedShellLease {
  readonly id: string
  readonly completion: Promise<number>
  readonly release: SupervisedShellLease["release"]
  readonly terminate: SupervisedShellLease["terminate"]
  private readonly lease: SupervisedShellLease
  constructor(lease: SupervisedShellLease, admission: ShellAdmission) {
    this.lease = lease
    this.id = lease.id
    this.completion = lease.completion
    this.release = admission.release.bind(admission)
    this.terminate = admission.terminate.bind(admission)
  }
  get state(): SupervisedShellLeaseState {
    return this.lease.state
  }
}
