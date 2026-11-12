import { type ComputerUse } from "#synapse/modules"
import { PiComputerCommandHandler } from "./command-handler"
import {
  PI_COMPUTER_COMMAND_DESCRIPTION,
  PI_COMPUTER_COMMAND_NAME,
  PI_COMPUTER_SEQUENTIAL,
  PI_COMPUTER_SHUTDOWN_EVENT,
  PI_COMPUTER_TOOL_DESCRIPTION,
  PI_COMPUTER_TOOL_GUIDELINES,
  PI_COMPUTER_TOOL_LABEL,
  PI_COMPUTER_TOOL_NAME,
  PI_COMPUTER_TOOL_SNIPPET,
} from "./constants"
import { PiComputerToolHandler } from "./tool-handler"
import { PI_COMPUTER_PARAMETERS } from "./tool-schema"
import { type PiComputerHost } from "./types"

export function registerComputerUse(pi: PiComputerHost, computerUse: ComputerUse): void {
  const tool = new PiComputerToolHandler(computerUse)
  const command = new PiComputerCommandHandler(computerUse)
  pi.registerTool({
    name: PI_COMPUTER_TOOL_NAME,
    label: PI_COMPUTER_TOOL_LABEL,
    description: PI_COMPUTER_TOOL_DESCRIPTION,
    promptSnippet: PI_COMPUTER_TOOL_SNIPPET,
    promptGuidelines: PI_COMPUTER_TOOL_GUIDELINES,
    executionMode: PI_COMPUTER_SEQUENTIAL,
    parameters: PI_COMPUTER_PARAMETERS,
    execute: tool.execute.bind(tool),
  })
  pi.registerCommand(PI_COMPUTER_COMMAND_NAME, {
    description: PI_COMPUTER_COMMAND_DESCRIPTION,
    handler: command.execute.bind(command),
  })
  pi.on(PI_COMPUTER_SHUTDOWN_EVENT, computerUse.stop.bind(computerUse))
}
