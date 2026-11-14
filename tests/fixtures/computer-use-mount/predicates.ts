import { COMPUTER_MOUNT_PROCESS_ABSENT_CODE, COMPUTER_MOUNT_PROCESS_ERROR_CODE } from "./constants"

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
