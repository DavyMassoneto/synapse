import {
  type Api,
  type AssistantMessage,
  type Context,
  createAssistantMessageEventStream,
  type Model,
  type ModelsSimpleStreamOptions,
} from "@earendil-works/pi-ai";
import type { SessionProjection } from "@earendil-works/pi-coding-agent";
import type {
  AdvisorContext,
  AdvisorRegistry,
  AdvisorSession,
  AdvisorUI,
} from "#synapse/integration";

import { TEST_USAGE } from "./usage.ts";

export class TestRegistry implements AdvisorRegistry {
  calls = 0;
  stopReason: "stop" | "aborted" = "stop";
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

export class TestSession implements AdvisorSession {
  projectionError = false;
  buildSessionProjection(): SessionProjection {
    if (this.projectionError) {
      throw new Error("projection failed");
    }
    return { entries: [], messages: [], thinkingLevel: "off", model: null };
  }
}

export class TestUI implements AdvisorUI {
  notices: string[] = [];
  selection: string | undefined;
  notify(message: string): void {
    this.notices.push(message);
  }
  async select(): Promise<string | undefined> {
    return this.selection;
  }
  setStatus(): void {}
}

export class TestContext implements AdvisorContext {
  hasUI = false;
  scopedModels: AdvisorContext["scopedModels"] = [];
  readonly modelRegistry = new TestRegistry();
  readonly sessionManager = new TestSession();
  readonly ui = new TestUI();
  getSystemPrompt(): string {
    return "system";
  }
}
