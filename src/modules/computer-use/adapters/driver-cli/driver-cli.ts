import { type ComputerDriverLaunch } from "#synapse/modules/computer-use/public/contracts"
import { computerRunCommand } from "../command-execution"
import {
  COMPUTER_RAW_MANIFEST_SCHEMA,
  type ComputerRawManifest,
  computerParseDriverJson,
} from "../driver-response-validation"
import { COMPUTER_CLI_MANIFEST_ARGUMENT, COMPUTER_CLI_MAX_BUFFER_BYTES, COMPUTER_CLI_UTF8 } from "./constants"

export class ComputerDriverCli {
  private readonly launch: ComputerDriverLaunch

  constructor(launch: ComputerDriverLaunch) {
    this.launch = launch
  }

  async manifest(): Promise<ComputerRawManifest> {
    const text = await this.execute([COMPUTER_CLI_MANIFEST_ARGUMENT])
    return computerParseDriverJson(COMPUTER_RAW_MANIFEST_SCHEMA, text)
  }

  private async execute(argumentsValue: string[]): Promise<string> {
    const result = await computerRunCommand(this.launch.command, [...this.launch.arguments, ...argumentsValue], {
      env: this.launch.environment,
      timeout: this.launch.timeoutMilliseconds,
      windowsHide: this.launch.windowsHide,
      maxBuffer: COMPUTER_CLI_MAX_BUFFER_BYTES,
      encoding: COMPUTER_CLI_UTF8,
    })
    return result.stdout
  }
}
