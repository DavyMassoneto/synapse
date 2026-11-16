import {
  SUPERVISED_SHELL_CLOSED,
  type SupervisedShellLease,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"

export class ShellAdmission {
  readonly cancellation = new AbortController()
  revoked = false
  private lease?: SupervisedShellLease
  private stopping?: Promise<void>
  private readonly registry: Set<ShellAdmission>
  private readonly prepared = Promise.withResolvers<void>()
  readonly completion = this.prepared.promise
  constructor(registry: Set<ShellAdmission>) {
    this.registry = registry
  }
  publish(lease: SupervisedShellLease): void {
    this.lease = lease
  }
  finish(): void {
    this.prepared.resolve()
  }
  release(): void {
    if (this.revoked || !this.lease) {
      throw new Error(SUPERVISED_SHELL_CLOSED)
    }
    this.lease.release()
  }
  async creationFailed(): Promise<void> {
    if (this.lease) {
      await this.terminate()
    } else {
      this.registry.delete(this)
    }
  }
  terminate(): Promise<void> {
    if (!this.stopping) {
      this.stopping = this.finishOwnership()
    }
    return this.stopping
  }
  private async finishOwnership(): Promise<void> {
    if (this.lease) {
      await this.lease.terminate()
      this.registry.delete(this)
    }
  }
  async stop(): Promise<void> {
    this.revoked = true
    this.cancellation.abort()
    await this.completion
    await this.terminate()
  }
}
