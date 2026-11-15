import { type BashOperations } from "@earendil-works/pi-coding-agent"
import { type SupervisedShellService } from "#synapse/modules/agent-team"
import { requireSupervisedBashDirectory } from "./directory"
import { SupervisedBashExecution } from "./execution"
import { SupervisedBashOutput } from "./output"
import { SupervisedBashRequest } from "./request"
import { buildSupervisedBashSpec } from "./spec"
import { type SupervisedBashOptions, type SupervisedBashResult } from "./types"
import { validateSupervisedBashOptions } from "./validate-options"

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
    const environment = validateSupervisedBashOptions(options)
    const spec = buildSupervisedBashSpec(command, cwd, environment, this.shellPath)
    const request = new SupervisedBashRequest(options)
    try {
      await requireSupervisedBashDirectory(cwd)
      const lease = await this.supervisor.create(
        spec,
        new SupervisedBashOutput(options),
        request.deadline.cancellation.signal,
      )
      const execution = new SupervisedBashExecution(lease, request.deadline)
      return { exitCode: await execution.run() }
    } finally {
      request.close()
    }
  }
}
