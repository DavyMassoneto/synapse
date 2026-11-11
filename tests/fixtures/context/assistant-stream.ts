import { type AssistantMessage, createAssistantMessageEventStream } from "@earendil-works/pi-ai"
import { TEST_USAGE } from "./constants"
import { type TestStopReason } from "./types"

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
