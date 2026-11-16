import { checkedWindowsShell } from "#synapse/modules/agent-team/adapters/supervised-shell/windows"

export class ProbeResultScenario {
  accepted = false
  failure?: Error
  check(stdout: string): void {
    checkedWindowsShell(this.accept.bind(this), this.reject.bind(this), null, stdout, "")
  }
  private accept(): void {
    this.accepted = true
  }
  private reject(error: Error): void {
    this.failure = error
  }
}
