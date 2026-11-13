import { type IphoneSimulatorCommandOutput } from "#synapse/modules"
import { type PiIphoneExecutionHost } from "./types"

export class PiIphoneSimulatorExecutor {
  private readonly host: PiIphoneExecutionHost

  constructor(host: PiIphoneExecutionHost) {
    this.host = host
  }

  async execute(signal: AbortSignal, command: string, args: string[]): Promise<IphoneSimulatorCommandOutput> {
    signal.throwIfAborted()
    const result = await this.host.exec(command, args, { signal })
    signal.throwIfAborted()
    if (result.code !== 0) {
      throw new Error(result.stderr)
    }
    return { stdout: result.stdout, stderr: result.stderr }
  }
}
