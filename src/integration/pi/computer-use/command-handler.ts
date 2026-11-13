import { COMPUTER_DIAGNOSTIC_READY, COMPUTER_INSTALL_SUCCEEDED, type ComputerUse } from "#synapse/modules"
import {
  PI_COMPUTER_COMMAND_DOCTOR,
  PI_COMPUTER_COMMAND_INSTALL,
  PI_COMPUTER_COMMAND_NO_ARGUMENT,
  PI_COMPUTER_COMMAND_RESET,
  PI_COMPUTER_COMMAND_STATUS,
  PI_COMPUTER_COMMAND_STOPPED,
  PI_COMPUTER_COMMAND_UNKNOWN,
  PI_COMPUTER_NOTICE_ERROR,
  PI_COMPUTER_NOTICE_INFO,
} from "./constants"
import { type PiComputerCommandContext } from "./types"

export class PiComputerCommandHandler {
  private readonly computer: ComputerUse

  constructor(computer: ComputerUse) {
    this.computer = computer
  }

  async execute(argumentsValue: string, context: PiComputerCommandContext): Promise<void> {
    const command = argumentsValue.trim()
    switch (command) {
      case PI_COMPUTER_COMMAND_INSTALL: {
        const result = await this.computer.install()
        context.ui.notify(
          JSON.stringify(result),
          result.kind === COMPUTER_INSTALL_SUCCEEDED ? PI_COMPUTER_NOTICE_INFO : PI_COMPUTER_NOTICE_ERROR,
        )
        break
      }
      case PI_COMPUTER_COMMAND_RESET:
        await this.computer.stop()
        context.ui.notify(PI_COMPUTER_COMMAND_STOPPED, PI_COMPUTER_NOTICE_INFO)
        break
      case PI_COMPUTER_COMMAND_STATUS:
      case PI_COMPUTER_COMMAND_DOCTOR:
      case PI_COMPUTER_COMMAND_NO_ARGUMENT: {
        const result = await this.computer.diagnose()
        context.ui.notify(
          JSON.stringify(result),
          result.kind === COMPUTER_DIAGNOSTIC_READY ? PI_COMPUTER_NOTICE_INFO : PI_COMPUTER_NOTICE_ERROR,
        )
        break
      }
      default:
        context.ui.notify(PI_COMPUTER_COMMAND_UNKNOWN, PI_COMPUTER_NOTICE_ERROR)
    }
  }
}
