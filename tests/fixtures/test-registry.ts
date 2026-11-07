import {
  type Api,
  type AssistantMessage,
  type Context,
  createAssistantMessageEventStream,
  type Model,
  type ModelsSimpleStreamOptions,
} from "@earendil-works/pi-ai";
import type { AdvisorRegistry } from "#synapse/integration";
import type { TestStopReason } from "./test-context-types";
import { TEST_USAGE } from "./usage";

export class TestRegistry implements AdvisorRegistry {
  calls = 0;
  stopReason: TestStopReason = "stop";
  readonly model: Model<Api> = {
    provider: "provider",
    id: "model",
    name: "model",
    api: "anthropic-messages",
    baseUrl: "https://example.invalid",
    input: ["text"],
    contextWindow: 40_000,
    maxTokens: 32_000,
    reasoning: true,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  };

  getAvailable(): Model<Api>[] {
    return [
      this.model,
      { ...this.model, id: "other", name: "other" },
      { ...this.model, id: "thinkingx", name: "thinkingx" },
    ];
  }
  find(): Model<Api> {
    this.calls += 1;
    return this.model;
  }
  hasConfiguredAuth(): boolean {
    return true;
  }
  streamSimple(_model: Model<Api>, _context: Context, _options?: ModelsSimpleStreamOptions) {
    const stream = createAssistantMessageEventStream();
    const message: AssistantMessage = {
      role: "assistant",
      content: [{ type: "text", text: "conselho" }],
      api: "anthropic-messages",
      provider: "provider",
      model: "model",
      stopReason: this.stopReason,
      usage: TEST_USAGE,
      timestamp: Date.now(),
    };
    stream.end(message);
    return stream;
  }
}
