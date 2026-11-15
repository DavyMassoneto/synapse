import {
  COMPUTER_DRIVER_MAX_ELEMENTS_PROPERTY,
  COMPUTER_DRIVER_TREE_FORMAT_PROPERTY,
  type ComputerDriverTool,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_INPUT_DELIVERY_MODE, COMPUTER_INPUT_ELEMENT_TOKEN, COMPUTER_INPUT_X } from "./constants"
import { type ComputerRawTools } from "./types"

export function computerConvertTools(raw: ComputerRawTools): ComputerDriverTool[] {
  const tools: ComputerDriverTool[] = []
  for (const tool of raw.tools) {
    const inputProperties: string[] = []
    if (tool.inputSchema.properties?.element_token) {
      inputProperties.push(COMPUTER_INPUT_ELEMENT_TOKEN)
    }
    if (tool.inputSchema.properties?.delivery_mode) {
      inputProperties.push(COMPUTER_INPUT_DELIVERY_MODE)
    }
    if (tool.inputSchema.properties?.x) {
      inputProperties.push(COMPUTER_INPUT_X)
    }
    if (tool.inputSchema.properties?.tree_format) {
      inputProperties.push(COMPUTER_DRIVER_TREE_FORMAT_PROPERTY)
    }
    if (tool.inputSchema.properties?.max_elements) {
      inputProperties.push(COMPUTER_DRIVER_MAX_ELEMENTS_PROPERTY)
    }
    tools.push({ name: tool.name, inputProperties })
  }
  return tools
}
