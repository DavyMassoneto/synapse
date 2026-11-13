import { COMPUTER_OVERLAY_DISABLED, COMPUTER_OVERLAY_VARIABLE } from "./constants"

export function hasComputerOverlay(environment: NodeJS.ProcessEnv): boolean {
  return environment[COMPUTER_OVERLAY_VARIABLE] !== COMPUTER_OVERLAY_DISABLED
}
