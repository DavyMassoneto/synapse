import { type BashOperations } from "@earendil-works/pi-coding-agent"
import { type SupervisedShellService } from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_BASH_ABORTED, SUPERVISED_BASH_MISSING_ENV } from "./constants"
import { SupervisedBashDeadline } from "./deadline"
import { requireSupervisedBashDirectory } from "./directory"
import { SupervisedBashExecution } from "./execution"
import { SupervisedBashOutput } from "./output"
import { buildSupervisedBashSpec } from "./spec"
import { type SupervisedBashOptions, type SupervisedBashResult } from "./types"
import { validateSupervisedBashTimeout } from "./validate-timeout"

export class SupervisedBashOperations implements BashOperations {
  private readonly supervisor: SupervisedShellService
  private readonly shellPath?: string
  constructor(supervisor: SupervisedShellService, shellPath?: string) {
    this.supervisor = supervisor
    if (shellPath) {
      this.shellPath = shellPath
    }
  }

  async exec(command: string, cwd: string, options: SupervisedBashOptions): Promise<SupervisedBashResult> {
    validateSupervisedBashTimeout(options.timeout)
    if (options.signal?.aborted) {
      throw new Error(SUPERVISED_BASH_ABORTED)
    }
    if (!options.env) {
      throw new Error(SUPERVISED_BASH_MISSING_ENV)
    }
    await requireSupervisedBashDirectory(cwd)
    const spec = buildSupervisedBashSpec(command, cwd, options.env, this.shellPath)
    const deadline = new SupervisedBashDeadline(options.timeout)
    const abort = deadline.abort.bind(deadline)
    options.signal?.addEventListener("abort", abort, { once: true })
    try {
      if (options.signal?.aborted) {
        deadline.abort()
      }
      const lease = await this.supervisor.create(spec, new SupervisedBashOutput(options), deadline.cancellation.signal)
      const execution = new SupervisedBashExecution(lease, deadline)
      return { exitCode: await execution.run() }
    } finally {
      deadline.close()
      options.signal?.removeEventListener("abort", abort)
    }
  }
}
