import {
  type Api,
  type AssistantMessage,
  type Context,
  createAssistantMessageEventStream,
  type Model,
  type ModelsSimpleStreamOptions,
} from "@earendil-works/pi-ai";
import type { AdvisorModelRegistry } from "#synapse/integration";
import { TEST_USAGE } from "./usage";

export class RegistryFixture implements AdvisorModelRegistry {
  used: Model<Api> | undefined;
  options: ModelsSimpleStreamOptions | undefined;
  context: Context | undefined;
  window = 128_000;

  find(provider: string, id: string): Model<Api> {
    return {
      provider,
      id,
      name: id,
      api: "anthropic-messages",
      baseUrl: "https://example.invalid",
      input: ["text"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      reasoning: true,
      contextWindow: this.window,
      maxTokens: 32_000,
    };
  }

  hasConfiguredAuth(): boolean {
    return true;
  }

  streamSimple(model: Model<Api>, context: Context, options?: ModelsSimpleStreamOptions) {
    this.used = model;
    this.context = context;
    this.options = options;
    const stream = createAssistantMessageEventStream();
    const message: AssistantMessage = {
      role: "assistant",
      content: [{ type: "text", text: "ok" }],
      api: "anthropic-messages",
      provider: "provider",
      model: model.id,
      usage: TEST_USAGE,
      stopReason: "stop",
      timestamp: Date.now(),
    };
    stream.end(message);
    return stream;
  }
}
