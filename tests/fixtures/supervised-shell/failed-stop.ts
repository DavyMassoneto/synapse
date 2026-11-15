import {
  type SupervisedShellLease,
  type SupervisedShellService,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { SUPERVISED_TEST_KILL_ERROR } from "./constants"

export class FailedStopShell implements SupervisedShellService {
  async create(): Promise<SupervisedShellLease> {
    return {
      id: SUPERVISED_TEST_KILL_ERROR,
      state: "quarantined",
      completion: new Promise<number>(this.pending.bind(this)),
      release: this.release.bind(this),
      terminate: this.terminate.bind(this),
    }
  }
  private pending(): void {
    this.calls = 0
  }
  calls = 0
  private release(): void {
    this.calls++
  }
  private async terminate(): Promise<void> {
    this.calls++
    throw new Error(SUPERVISED_TEST_KILL_ERROR)
  }
  async stop(): Promise<void> {
    this.calls++
  }
  async close(): Promise<void> {
    this.calls++
  }
}
