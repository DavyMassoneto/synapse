import { COMPUTER_DRIVER_TELEMETRY_REQUEST_ENABLED, COMPUTER_DRIVER_TELEMETRY_REQUEST_VARIABLE } from "./constants"

export function hasComputerTelemetryRequest(environment: NodeJS.ProcessEnv): boolean {
  return environment[COMPUTER_DRIVER_TELEMETRY_REQUEST_VARIABLE] === COMPUTER_DRIVER_TELEMETRY_REQUEST_ENABLED
}
