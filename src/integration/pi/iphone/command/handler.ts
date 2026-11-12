import { IPHONE_REFUSED, type IphoneModule } from "#synapse/modules"
import { iphoneConfigurationChanges } from "./configuration-input"
import {
  PI_IPHONE_COMMAND_CLOSED,
  PI_IPHONE_COMMAND_CONFIG,
  PI_IPHONE_COMMAND_DOCTOR,
  PI_IPHONE_COMMAND_EMPTY,
  PI_IPHONE_COMMAND_LEVEL,
  PI_IPHONE_COMMAND_LOG,
  PI_IPHONE_COMMAND_RESET,
  PI_IPHONE_COMMAND_START,
  PI_IPHONE_COMMAND_STARTED,
  PI_IPHONE_COMMAND_STATUS,
  PI_IPHONE_COMMAND_STOP,
  PI_IPHONE_COMMAND_UPDATED,
  PI_IPHONE_COMMAND_USAGE,
  PI_IPHONE_COMMAND_WORDS,
} from "./constants"
import { type PiIphoneCommandContext } from "./types"

export class PiIphoneCommand {
  private readonly iphone: IphoneModule

  private readonly cancellation = new AbortController()

  constructor(iphone: IphoneModule) {
    this.iphone = iphone
  }

  async handle(raw: string, context: PiIphoneCommandContext): Promise<void> {
    const command = raw.trim().split(PI_IPHONE_COMMAND_WORDS)[0]
    const signal = this.cancellation.signal
    let text = PI_IPHONE_COMMAND_USAGE
    switch (command) {
      case PI_IPHONE_COMMAND_EMPTY:
      case PI_IPHONE_COMMAND_STATUS:
      case PI_IPHONE_COMMAND_DOCTOR:
        text = JSON.stringify(await this.iphone.diagnose(signal))
        break
      case PI_IPHONE_COMMAND_CONFIG:
        text = this.configuration(raw)
        break
      case PI_IPHONE_COMMAND_LOG:
        text = JSON.stringify(this.iphone.log())
        break
      case PI_IPHONE_COMMAND_START:
        await this.iphone.startServer(signal)
        text = PI_IPHONE_COMMAND_STARTED
        break
      case PI_IPHONE_COMMAND_RESET:
        await this.iphone.reset(signal)
        text = PI_IPHONE_COMMAND_CLOSED
        break
      case PI_IPHONE_COMMAND_STOP:
        await this.iphone.stopServer()
        text = PI_IPHONE_COMMAND_CLOSED
        break
    }
    context.ui.notify(text, PI_IPHONE_COMMAND_LEVEL)
  }

  cancel(): void {
    this.cancellation.abort()
  }

  private configuration(raw: string): string {
    const changes = iphoneConfigurationChanges(raw)
    if (changes.length === 0) {
      return JSON.stringify(this.iphone.configuration())
    }
    const outcome = this.iphone.configure(changes)
    if (outcome.kind === IPHONE_REFUSED) {
      throw new Error(outcome.message)
    }
    return PI_IPHONE_COMMAND_UPDATED
  }
}
