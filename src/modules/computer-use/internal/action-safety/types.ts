export interface ComputerSafetyAllowed {
  kind: "safety-allowed"
}

export interface ComputerSafetyRefused {
  kind: "safety-refused"
  message: string
}

export type ComputerSafetyResult = ComputerSafetyAllowed | ComputerSafetyRefused
