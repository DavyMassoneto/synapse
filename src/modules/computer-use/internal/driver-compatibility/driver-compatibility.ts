import {
  COMPUTER_DRIVER_COMPATIBLE,
  COMPUTER_DRIVER_INCOMPATIBLE,
  COMPUTER_DRIVER_MINIMUM_VERSION,
  COMPUTER_DRIVER_SEMVER_PATTERN,
  COMPUTER_DRIVER_VERSION_MESSAGE,
} from "./constants"
import { type ComputerDriverCompatibility } from "./types"

export function computerCheckDriverVersion(version: string): ComputerDriverCompatibility {
  const match = COMPUTER_DRIVER_SEMVER_PATTERN.exec(version)
  if (match) {
    const parts = match.slice(1).map(Number)
    for (const [index, minimum] of COMPUTER_DRIVER_MINIMUM_VERSION.entries()) {
      const part = parts[index]
      if (typeof part === "number") {
        if (part > minimum) {
          return { kind: COMPUTER_DRIVER_COMPATIBLE, version }
        }
        if (part < minimum) {
          return { kind: COMPUTER_DRIVER_INCOMPATIBLE, message: COMPUTER_DRIVER_VERSION_MESSAGE }
        }
      }
    }
    return { kind: COMPUTER_DRIVER_COMPATIBLE, version }
  }
  return { kind: COMPUTER_DRIVER_INCOMPATIBLE, message: COMPUTER_DRIVER_VERSION_MESSAGE }
}
