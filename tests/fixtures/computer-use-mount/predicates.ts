import {
  COMPUTER_MOUNT_PROCESS_ABSENT_CODE,
  COMPUTER_MOUNT_PROCESS_ERROR_CODE,
  COMPUTER_MOUNT_SESSION_END,
  COMPUTER_MOUNT_TEXT,
  COMPUTER_MOUNT_TOOL_RESULT_ROLE,
} from "./constants"
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

export function isComputerMountProcessAbsent(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return false
  } catch (error) {
    if (
      error instanceof Error &&
      COMPUTER_MOUNT_PROCESS_ERROR_CODE in error &&
      error.code === COMPUTER_MOUNT_PROCESS_ABSENT_CODE
    ) {
      return true
    }
    throw error
  }
}
