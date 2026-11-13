import {
  COMPUTER_MOUNT_DRIVER_STARTED,
  COMPUTER_MOUNT_PID_MISSING,
  COMPUTER_MOUNT_PROCESS_STILL_ALIVE,
} from "./constants"
import { isComputerMountProcessAbsent } from "./predicates"
import { type ComputerMountEvent } from "./types"

export function computerMountDriverPid(events: ComputerMountEvent[]): number {
  const processes: number[] = []
  for (const event of events) {
    if (event.name === COMPUTER_MOUNT_DRIVER_STARTED) {
      if (!event.pid || !Number.isInteger(event.pid) || event.pid < 1 || processes.length > 0) {
        throw new Error(COMPUTER_MOUNT_PID_MISSING)
      }
      processes.push(event.pid)
    }
  }
  const pid = processes[0]
  if (!pid) {
    throw new Error(COMPUTER_MOUNT_PID_MISSING)
  }
  return pid
}

export function requireComputerMountProcessExited(pid: number): void {
  if (!isComputerMountProcessAbsent(pid)) {
    throw new Error(COMPUTER_MOUNT_PROCESS_STILL_ALIVE)
  }
}
