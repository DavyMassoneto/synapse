import {
  type SupervisedShellLease,
  type SupervisedShellService,
} from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_TEST_KILL_ERROR, SUPERVISED_TEST_QUARANTINED_STATE } from "./constants"

export class FailedStopShell implements SupervisedShellService {
  async create(): Promise<SupervisedShellLease> {
    return {
      id: SUPERVISED_TEST_KILL_ERROR,
      state: SUPERVISED_TEST_QUARANTINED_STATE,
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
