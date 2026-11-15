import { type SupervisedShellSpec } from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_BASH_ABORT_EVENT, SUPERVISED_BASH_ABORTED, SUPERVISED_BASH_MISSING_ENV } from "./constants"
import { SupervisedBashDeadline } from "./deadline"
import { buildSupervisedBashSpec } from "./spec"
import { type SupervisedBashAbort, type SupervisedBashOptions } from "./types"
import { validateSupervisedBashTimeout } from "./validate-timeout"

export class SupervisedBashRequest {
  readonly deadline: SupervisedBashDeadline
  readonly spec: SupervisedShellSpec
  private readonly signal?: AbortSignal
  private readonly abort: SupervisedBashAbort
  constructor(command: string, cwd: string, options: SupervisedBashOptions, shellPath?: string) {
    validateSupervisedBashTimeout(options.timeout)
    if (options.signal?.aborted) {
      throw new Error(SUPERVISED_BASH_ABORTED)
    }
    if (!options.env) {
      throw new Error(SUPERVISED_BASH_MISSING_ENV)
    }
    this.spec = buildSupervisedBashSpec(command, cwd, options.env, shellPath)
    this.deadline = new SupervisedBashDeadline(options.timeout)
    this.abort = this.deadline.abort.bind(this.deadline)
    if (options.signal) {
      this.signal = options.signal
      options.signal.addEventListener(SUPERVISED_BASH_ABORT_EVENT, this.abort, { once: true })
      if (options.signal.aborted) {
        this.deadline.abort()
      }
    }
  }
  close(): void {
    this.deadline.close()
    this.signal?.removeEventListener(SUPERVISED_BASH_ABORT_EVENT, this.abort)
  }
}
