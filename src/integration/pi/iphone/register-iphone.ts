import { type IphoneModule } from "#synapse/modules"
import { PI_IPHONE_COMMAND_DESCRIPTION, PI_IPHONE_COMMAND_NAME, PiIphoneCommand } from "./command"
import { PI_IPHONE_SHUTDOWN_EVENT } from "./constants"
import { registeredIphoneTool } from "./registered-tool"
import { PiIphoneShutdown } from "./shutdown"
import { PiIphoneTool } from "./tool"
import { type PiIphoneHost } from "./types"

export function registerIphone(pi: PiIphoneHost, iphone: IphoneModule): void {
  const tool = new PiIphoneTool(iphone)
  const command = new PiIphoneCommand(iphone)
  const shutdown = new PiIphoneShutdown(iphone, command)
  pi.registerTool(registeredIphoneTool(tool))
  pi.registerCommand(PI_IPHONE_COMMAND_NAME, {
    description: PI_IPHONE_COMMAND_DESCRIPTION,
    handler: command.handle.bind(command),
  })
  pi.on(PI_IPHONE_SHUTDOWN_EVENT, shutdown.shutdown.bind(shutdown))
}
