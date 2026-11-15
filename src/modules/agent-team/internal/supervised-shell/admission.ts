import {
  SUPERVISED_SHELL_CLOSED,
  type SupervisedShellLease,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { type AdmissionResolve } from "./types"

export class ShellAdmission {
  readonly cancellation = new AbortController()
  revoked = false
  private lease?: SupervisedShellLease
  private finished?: AdmissionResolve
  readonly completion: Promise<void>
  constructor() {
    this.completion = new Promise<void>(this.capture.bind(this))
  }
  private capture(resolve: AdmissionResolve): void {
    this.finished = resolve
  }
  publish(lease: SupervisedShellLease): void {
    this.lease = lease
  }
  finish(): void {
    this.finished?.()
  }
  release(): void {
    if (this.revoked || !this.lease) {
      throw new Error(SUPERVISED_SHELL_CLOSED)
    }
    this.lease.release()
  }
  async stop(): Promise<void> {
    this.revoked = true
    this.cancellation.abort()
    await this.completion
    await this.lease?.terminate()
  }
}
