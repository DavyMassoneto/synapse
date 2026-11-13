import { type IphoneModule } from "#synapse/modules"
import { type PiIphoneCommand } from "./command"

export class PiIphoneShutdown {
  private readonly iphone: IphoneModule

  private readonly command: PiIphoneCommand

  constructor(iphone: IphoneModule, command: PiIphoneCommand) {
    this.iphone = iphone
    this.command = command
  }

  async shutdown(): Promise<void> {
    this.command.cancel()
    await this.iphone.shutdown()
  }
}
