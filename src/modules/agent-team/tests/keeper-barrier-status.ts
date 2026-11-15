import { SHELL_KEEPER_BARRIER_FILE } from "./constants"
import { SHELL_BARRIER_ZOMBIE_PATTERN } from "./native-scenario-constants"

export function verifyBarrierStatus(status: string): void {
  if (!status || SHELL_BARRIER_ZOMBIE_PATTERN.test(status) || !status.includes(SHELL_KEEPER_BARRIER_FILE.slice(2))) {
    throw new Error(status)
  }
}
