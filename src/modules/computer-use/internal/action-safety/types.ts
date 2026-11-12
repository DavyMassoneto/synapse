import { type COMPUTER_SAFETY_ALLOWED, type COMPUTER_SAFETY_REFUSED } from "./constants"

export interface ComputerSafetyAllowed {
  kind: typeof COMPUTER_SAFETY_ALLOWED
}

export interface ComputerSafetyRefused {
  kind: typeof COMPUTER_SAFETY_REFUSED
  message: string
}

export type ComputerSafetyResult = ComputerSafetyAllowed | ComputerSafetyRefused
