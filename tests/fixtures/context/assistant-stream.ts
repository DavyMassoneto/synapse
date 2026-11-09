import { type AssistantMessage, createAssistantMessageEventStream } from "@earendil-works/pi-ai"
import { type TestStopReason } from "./types"
import { TEST_USAGE } from "./usage"

export function assistantStream(model: string, text: string, stopReason: TestStopReason) {
  const stream = createAssistantMessageEventStream()
  const message: AssistantMessage = {
    role: "assistant",
    content: [{ type: "text", text }],
    api: "anthropic-messages",
    provider: "provider",
    model,
    stopReason,
    usage: TEST_USAGE,
    timestamp: Date.now(),
  }
  stream.end(message)
  return stream
}
