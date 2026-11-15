import { type BashOperations } from "@earendil-works/pi-coding-agent"
import { type SupervisedShellService } from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_BASH_ABORTED, SUPERVISED_BASH_MISSING_ENV } from "./constants"
import { SupervisedBashDeadline } from "./deadline"
import { requireSupervisedBashDirectory } from "./directory"
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
    const lease = await this.supervisor.create(spec, new SupervisedBashOutput(options))
    const deadline = new SupervisedBashDeadline(lease, options.timeout)
    const abort = deadline.abort.bind(deadline)
    options.signal?.addEventListener("abort", abort, { once: true })
    try {
      if (options.signal?.aborted) {
        await lease.terminate()
        throw new Error(SUPERVISED_BASH_ABORTED)
      }
      lease.release()
      const exitCode = await Promise.race([lease.completion, deadline.failed])
      if (options.signal?.aborted) {
        throw new Error(SUPERVISED_BASH_ABORTED)
      }
      deadline.check()
      return { exitCode }
    } finally {
      deadline.close()
      options.signal?.removeEventListener("abort", abort)
    }
  }
}
