import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell"
import { type SupervisedBashOptions } from "./types"

export class SupervisedBashOutput implements SupervisedShellOutput {
  private readonly options: SupervisedBashOptions
  constructor(options: SupervisedBashOptions) {
    this.options = options
  }
  async write(data: Buffer): Promise<void> {
    this.options.onData(data)
  }
}
