import {
  PI_IPHONE_PARAMETERS,
  PI_IPHONE_TOOL_DESCRIPTION,
  PI_IPHONE_TOOL_LABEL,
  PI_IPHONE_TOOL_NAME,
  type PiIphoneTool,
} from "./tool"
import { type PiIphoneToolDefinition } from "./types"

export function registeredIphoneTool(tool: PiIphoneTool): PiIphoneToolDefinition {
  return {
    name: PI_IPHONE_TOOL_NAME,
    label: PI_IPHONE_TOOL_LABEL,
    description: PI_IPHONE_TOOL_DESCRIPTION,
    parameters: PI_IPHONE_PARAMETERS,
    execute: tool.execute.bind(tool),
  }
}
