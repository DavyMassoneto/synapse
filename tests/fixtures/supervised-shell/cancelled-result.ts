import {
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellService,
  type SupervisedShellSpec,
} from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_TEST_KILL_ERROR, SUPERVISED_TEST_OUTPUT_FAILURE } from "./constants"
import { type CancelledResultCodeResolve, type CancelledResultResolve, type WindowsChannelReject } from "./types"

export class CancelledResultShell implements SupervisedShellService, SupervisedShellLease {
  readonly id = SUPERVISED_TEST_KILL_ERROR
  readonly state = "quarantined"
  readonly completion: Promise<number>
  readonly stopping: Promise<void>
  private rejectCompletion?: WindowsChannelReject
  private signalStop?: CancelledResultResolve
  private resolveStop?: CancelledResultResolve
  private rejectStop?: WindowsChannelReject
  private stopped?: Promise<void>
  constructor() {
    this.completion = new Promise<number>(this.captureCompletion.bind(this))
    this.stopping = new Promise<void>(this.captureStopping.bind(this))
  }
  private captureCompletion(_resolve: CancelledResultCodeResolve, reject: WindowsChannelReject): void {
    this.rejectCompletion = reject
  }
  private captureStopping(resolve: CancelledResultResolve): void {
    this.signalStop = resolve
  }
  private captureStop(resolve: CancelledResultResolve, reject: WindowsChannelReject): void {
    this.resolveStop = resolve
    this.rejectStop = reject
  }
  async create(_spec: SupervisedShellSpec, _output: SupervisedShellOutput): Promise<SupervisedShellLease> {
    return this
  }
  releases = 0
  release(): void {
    this.releases++
  }
  terminate(): Promise<void> {
    if (!this.stopped) {
      this.stopped = new Promise<void>(this.captureStop.bind(this))
      this.signalStop?.()
    }
    return this.stopped
  }
  loseOutput(): void {
    this.rejectCompletion?.(new Error(SUPERVISED_TEST_OUTPUT_FAILURE))
  }
  finish(failed: boolean): void {
    if (failed) {
      this.rejectStop?.(new Error(SUPERVISED_TEST_KILL_ERROR))
    } else {
      this.resolveStop?.()
    }
  }
  async stop(): Promise<void> {
    await this.terminate()
  }
  async close(): Promise<void> {
    await this.terminate()
  }
}
