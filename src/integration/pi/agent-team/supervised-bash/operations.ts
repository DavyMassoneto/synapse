import { type BashOperations } from "@earendil-works/pi-coding-agent"
import { type SupervisedShellService } from "#synapse/modules/agent-team/public/supervised-shell"
import { requireSupervisedBashDirectory } from "./directory"
import { SupervisedBashExecution } from "./execution"
import { SupervisedBashOutput } from "./output"
import { SupervisedBashRequest } from "./request"
import { type SupervisedBashOptions, type SupervisedBashResult } from "./types"

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
    const request = new SupervisedBashRequest(command, cwd, options, this.shellPath)
    try {
      await requireSupervisedBashDirectory(cwd)
      const lease = await this.supervisor.create(
        request.spec,
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
