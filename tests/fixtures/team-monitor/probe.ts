import { type ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { MONITOR_OUTPUT, MONITOR_PROGRESS, MONITOR_TOOL } from "./constants"
import { MONITOR_TOOL_PARAMETERS } from "./schemas"
import {
  type MonitorToolExecute,
  type MonitorToolInput,
  type MonitorToolRelease,
  type MonitorToolResult,
  type MonitorToolUpdate,
} from "./types"

export class MonitorProbe {
  private update?: MonitorToolUpdate

  private release?: MonitorToolRelease

  install(pi: ExtensionAPI): void {
    pi.registerTool({
      name: MONITOR_TOOL,
      label: MONITOR_TOOL,
      description: MONITOR_TOOL,
      parameters: MONITOR_TOOL_PARAMETERS,
      execute: this.execute.bind(this),
    })
  }

  execute(
    _id: string,
    _input: MonitorToolInput,
    _signal: Parameters<MonitorToolExecute>[2],
    update: MonitorToolUpdate,
  ): Promise<MonitorToolResult> {
    this.update = update
    return new Promise<MonitorToolResult>(this.capture.bind(this))
  }

  private capture(resolve: MonitorToolRelease): void {
    this.release = resolve
  }

  emit(): void {
    this.update?.({ content: [{ type: "text", text: MONITOR_PROGRESS }], details: { text: MONITOR_PROGRESS } })
  }

  finish(): void {
    this.release?.({ content: [{ type: "text", text: MONITOR_OUTPUT }], details: { text: MONITOR_OUTPUT } })
  }
}
