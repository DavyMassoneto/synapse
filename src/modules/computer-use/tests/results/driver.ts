import {
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
  type ComputerDriverPort,
  type ComputerDriverTool,
} from "#synapse/modules/computer-use/public"
import { computerResultsResponse } from "./support"
import { type ComputerResultsResponses } from "./types"

export class ComputerResultsDriver implements ComputerDriverPort {
  readonly calls: string[] = []

  readonly responses: ComputerResultsResponses = {
    configuration: computerResultsResponse(),
    cursor: computerResultsResponse(),
    input: computerResultsResponse(),
    capture: computerResultsResponse(),
    selection: computerResultsResponse(),
  }

  stops = 0

  async start(): Promise<ComputerDriverTool[]> {
    return [{ name: "bring_to_front", inputProperties: [] }]
  }

  async call(name: string, _argumentsValue: ComputerDriverArguments): Promise<ComputerDriverCallResult> {
    this.calls.push(name)
    switch (name) {
      case "set_config":
        return this.responses.configuration
      case "set_agent_cursor_enabled":
        return this.responses.cursor
      case "click":
      case "bring_to_front":
        return this.responses.input
      case "get_window_state":
        return this.responses.capture
      case "list_windows":
      case "list_apps":
        return this.responses.selection
      default:
        return computerResultsResponse()
    }
  }

  async stop(): Promise<void> {
    this.stops += 1
  }
}
