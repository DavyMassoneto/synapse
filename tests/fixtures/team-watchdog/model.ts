import {
  type Api,
  type AssistantMessage,
  type AssistantMessageEventStream,
  createAssistantMessageEventStream,
  type Model,
  type SimpleStreamOptions,
  type TranscriptContext,
} from "@earendil-works/pi-ai"
import { TEST_USAGE } from "../context"
import {
  WATCHDOG_ABORT_EVENT,
  WATCHDOG_ABORTED,
  WATCHDOG_COORD_TOOL,
  WATCHDOG_ERROR,
  WATCHDOG_EVENT_DONE,
  WATCHDOG_EVENT_ERROR,
  WATCHDOG_EVENT_START,
  WATCHDOG_EVENT_TEXT_DELTA,
  WATCHDOG_EVENT_THINKING_DELTA,
  WATCHDOG_EVENT_TOOL_DELTA,
  WATCHDOG_LEAD,
  WATCHDOG_NODE_EVAL_FLAG,
  WATCHDOG_PATH_SEPARATOR,
  WATCHDOG_PID_SCRIPT,
  WATCHDOG_PROMPT,
  WATCHDOG_ROLE_ASSISTANT,
  WATCHDOG_ROLE_TEXT,
  WATCHDOG_ROLE_TOOL_CALL,
  WATCHDOG_SHELL_ARGUMENT_SEPARATOR,
  WATCHDOG_SHELL_PATH_SEPARATOR,
  WATCHDOG_STOP,
  WATCHDOG_TOOL_ID,
  WATCHDOG_TOOL_NAME,
  WATCHDOG_TOOL_USE,
  WATCHDOG_UPDATED_TEXT,
} from "./constants"
import { quoteWatchdogShellArgument } from "./shell-command"
import { type WatchdogToolCall } from "./types"

export class WatchdogModel {
  private streamResult?: AssistantMessageEventStream

  private message?: AssistantMessage

  shell = false

  streams = 0

  private shellIssued = false

  private pendingTool = ""

  stream(model: Model<Api>, _context: TranscriptContext, options?: SimpleStreamOptions): AssistantMessageEventStream {
    this.streams++
    const stream = createAssistantMessageEventStream()
    const message = this.prepareMessage(model)
    this.streamResult = stream
    this.message = message
    options?.signal?.addEventListener(WATCHDOG_ABORT_EVENT, this.abort.bind(this), { once: true })
    stream.push({ type: WATCHDOG_EVENT_START, partial: message })
    if (options?.signal?.aborted) {
      this.abort()
    } else if (this.shell && !this.shellIssued) {
      this.shellIssued = true
      const command = [
        quoteWatchdogShellArgument(process.execPath.replace(WATCHDOG_PATH_SEPARATOR, WATCHDOG_SHELL_PATH_SEPARATOR)),
        WATCHDOG_NODE_EVAL_FLAG,
        quoteWatchdogShellArgument(WATCHDOG_PID_SCRIPT),
      ].join(WATCHDOG_SHELL_ARGUMENT_SEPARATOR)
      this.publishTool({
        type: WATCHDOG_ROLE_TOOL_CALL,
        id: WATCHDOG_TOOL_ID,
        name: WATCHDOG_TOOL_NAME,
        arguments: { command },
      })
    }
    return stream
  }

  private prepareMessage(model: Model<Api>): AssistantMessage {
    return {
      role: WATCHDOG_ROLE_ASSISTANT,
      api: model.api,
      provider: model.provider,
      model: model.id,
      timestamp: Date.now(),
      usage: TEST_USAGE,
      stopReason: WATCHDOG_STOP,
      content: [{ type: WATCHDOG_ROLE_TEXT, text: "" }],
    }
  }

  requestTool(name: string): void {
    this.pendingTool = name
  }

  dispatchTool(): void {
    if (this.streamResult && this.message && this.pendingTool) {
      if (this.pendingTool === WATCHDOG_COORD_TOOL) {
        this.publishTool({
          type: WATCHDOG_ROLE_TOOL_CALL,
          id: WATCHDOG_TOOL_ID,
          name: this.pendingTool,
          arguments: { agent: WATCHDOG_LEAD, message: WATCHDOG_PROMPT, mode: "coordination" },
        })
      } else {
        this.publishTool({ type: WATCHDOG_ROLE_TOOL_CALL, id: WATCHDOG_TOOL_ID, name: this.pendingTool, arguments: {} })
      }
      this.pendingTool = ""
    }
  }

  private publishTool(tool: WatchdogToolCall): void {
    if (this.streamResult && this.message) {
      this.message.stopReason = WATCHDOG_TOOL_USE
      this.message.content = [tool]
      this.streamResult.push({ type: WATCHDOG_EVENT_DONE, reason: WATCHDOG_TOOL_USE, message: this.message })
      this.streamResult.end(this.message)
    }
  }

  update(): void {
    if (this.streamResult && this.message) {
      this.message.content = [{ type: WATCHDOG_ROLE_TEXT, text: WATCHDOG_UPDATED_TEXT }]
      this.streamResult.push({
        type: WATCHDOG_EVENT_TEXT_DELTA,
        contentIndex: 0,
        delta: WATCHDOG_UPDATED_TEXT,
        partial: this.message,
      })
    }
  }

  toolDelta(): void {
    if (this.streamResult && this.message) {
      this.streamResult.push({ type: WATCHDOG_EVENT_TOOL_DELTA, contentIndex: 0, delta: "", partial: this.message })
    }
  }

  thinkingDelta(): void {
    if (this.streamResult && this.message) {
      this.streamResult.push({
        type: WATCHDOG_EVENT_THINKING_DELTA,
        contentIndex: 0,
        delta: WATCHDOG_UPDATED_TEXT,
        partial: this.message,
      })
    }
  }

  finish(): void {
    if (this.streamResult && this.message) {
      this.message.stopReason = WATCHDOG_STOP
      this.streamResult.push({ type: WATCHDOG_EVENT_DONE, reason: WATCHDOG_STOP, message: this.message })
      this.streamResult.end(this.message)
    }
  }

  fail(message: string): void {
    if (this.streamResult && this.message) {
      this.message.stopReason = WATCHDOG_ERROR
      this.message.errorMessage = message
      this.streamResult.push({ type: WATCHDOG_EVENT_ERROR, reason: WATCHDOG_ERROR, error: this.message })
      this.streamResult.end(this.message)
    }
  }

  private abort(): void {
    if (this.streamResult && this.message) {
      this.message.stopReason = WATCHDOG_ABORTED
      this.streamResult.push({ type: WATCHDOG_EVENT_ERROR, reason: WATCHDOG_ABORTED, error: this.message })
      this.streamResult.end(this.message)
    }
  }
}
