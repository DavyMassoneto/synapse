import { type Message } from "@earendil-works/pi-ai"
import { type RouterMessage } from "#synapse/modules"
import {
  PI_ROUTER_BLOCK_BREAK,
  PI_ROUTER_EMPTY_TEXT,
  PI_ROUTER_IMAGE_BLOCK,
  PI_ROUTER_SYSTEM_ROLE,
  PI_ROUTER_TEXT_BLOCK,
  PI_ROUTER_TOOL_CALL_BLOCK,
  PI_ROUTER_TOOL_RESULT_ROLE,
} from "./constants"

export function convertRouterMessage(message: Message): RouterMessage {
  const converted: RouterMessage = { role: message.role, text: PI_ROUTER_EMPTY_TEXT, image: false, calls: [] }

  convertRouterContent(message, converted)
  complementRouterRole(message, converted)
  return converted
}

function convertRouterContent(message: Message, converted: RouterMessage): void {
  if (typeof message.content === "string") {
    converted.text = message.content
  } else {
    for (const block of message.content) {
      if (block.type === PI_ROUTER_TEXT_BLOCK) {
        converted.text += `${block.text}${PI_ROUTER_BLOCK_BREAK}`
      } else if (block.type === PI_ROUTER_TOOL_CALL_BLOCK) {
        converted.calls.push({ name: block.name, arguments: JSON.stringify(block.arguments) })
      } else if (block.type === PI_ROUTER_IMAGE_BLOCK) {
        converted.image = true
      }
    }
  }
}

function complementRouterRole(message: Message, converted: RouterMessage): void {
  if (message.role === PI_ROUTER_SYSTEM_ROLE) {
    converted.text += `${PI_ROUTER_BLOCK_BREAK}${JSON.stringify(message.sections)}`
  }
  if (message.role === PI_ROUTER_TOOL_RESULT_ROLE) {
    converted.result = { name: message.toolName, error: message.isError }
  }
}
