import {
  COMPUTER_MOUNT_DRIVER_STARTED,
  COMPUTER_MOUNT_PID_MISSING,
  COMPUTER_MOUNT_PROCESS_STILL_ALIVE,
  COMPUTER_MOUNT_SESSION_END,
} from "./constants"
import { isComputerMountProcessAbsent } from "./predicates"
import { type ComputerMountEvent, type ComputerMountLifecycle } from "./types"

export function computerMountLifecycle(events: ComputerMountEvent[]): ComputerMountLifecycle {
  let pid = 0
  let sessionEndCount = 0
  for (const event of events) {
    if (event.name === COMPUTER_MOUNT_DRIVER_STARTED) {
      if (!event.pid || !Number.isInteger(event.pid) || event.pid < 1 || pid > 0) {
        throw new Error(COMPUTER_MOUNT_PID_MISSING)
      }
      pid = event.pid
    }
    if (event.name === COMPUTER_MOUNT_SESSION_END) {
      sessionEndCount++
    }
  }
  if (!pid) {
    throw new Error(COMPUTER_MOUNT_PID_MISSING)
  }
  return { pid, sessionEndCount }
}

export function requireComputerMountProcessExited(pid: number): void {
  if (!isComputerMountProcessAbsent(pid)) {
    throw new Error(COMPUTER_MOUNT_PROCESS_STILL_ALIVE)
  }
}
