import { COMPUTER_MOUNT_SESSION_END, COMPUTER_MOUNT_TEXT, COMPUTER_MOUNT_TOOL_RESULT_ROLE } from "./constants"
import { type ComputerMountRequestBlock, type ComputerMountRequestMessage } from "./types"

export function isComputerMountSessionEnd(name: string): boolean {
  return name === COMPUTER_MOUNT_SESSION_END
}

export function isComputerMountToolResult(message: ComputerMountRequestMessage): boolean {
  return message.role === COMPUTER_MOUNT_TOOL_RESULT_ROLE
}

export function isComputerMountText(block: ComputerMountRequestBlock): boolean {
  return block.type === COMPUTER_MOUNT_TEXT
}
