import { type ComputerDriverCallResult } from "#synapse/modules/computer-use/public"

export interface ComputerResultsResponses {
  configuration: ComputerDriverCallResult
  cursor: ComputerDriverCallResult
  input: ComputerDriverCallResult
  capture: ComputerDriverCallResult
  selection: ComputerDriverCallResult
}
