import {
  COMPUTER_DRIVER_SECRET_ENVIRONMENT_PATTERN,
  COMPUTER_DRIVER_TELEMETRY_DISABLED,
  COMPUTER_DRIVER_TELEMETRY_VARIABLE,
} from "./constants"
import { hasComputerTelemetryRequest } from "./predicates"

export function computerFilterDriverEnvironment(environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const filtered: NodeJS.ProcessEnv = {}
  for (const [name, value] of Object.entries(environment)) {
    if (!COMPUTER_DRIVER_SECRET_ENVIRONMENT_PATTERN.test(name)) {
      filtered[name] = value
    }
  }
  if (!hasComputerTelemetryRequest(environment)) {
    filtered[COMPUTER_DRIVER_TELEMETRY_VARIABLE] = COMPUTER_DRIVER_TELEMETRY_DISABLED
  }
  return filtered
}
