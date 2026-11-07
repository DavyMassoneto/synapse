import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type Api,
  type AssistantMessage,
  type Context,
  createAssistantMessageEventStream,
  type Model,
  type ModelsSimpleStreamOptions,
} from "@earendil-works/pi-ai";
import { buildBaseOptions } from "@earendil-works/pi-ai/api/simple-options";
import { normalizeContext } from "@earendil-works/pi-ai/utils/transcript";
import { AdvisorModel, type AdvisorModelRegistry } from "@/integration";
import { type ModelRequest } from "@/modules";
import { preparePrompt } from "@/modules/advisor/internal/format";

const USAGE = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
  totalTokens: 0,
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
};

class RegistryFixture implements AdvisorModelRegistry {
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
      usage: USAGE,
      stopReason: "stop",
      timestamp: Date.now(),
    };
    stream.end(message);
    return stream;
  }
}

async function resolvesIndependently(): Promise<void> {
  const registry = new RegistryFixture();
  const adapter = new AdvisorModel(registry);
  const first = await adapter.resolve("provider/first", "high");
  const second = await adapter.resolve("provider/second", "low");
  const prompt = preparePrompt(
    {
      system: "review",
      messages: [{ kind: "user", blocks: [{ kind: "text", text: "x".repeat(300_000) }] }],
    },
    first,
  );
  assert.ok(prompt);
  const request: ModelRequest = { system: "review", prompt };
  await adapter.consult(first, request);
  assert.equal(registry.used?.id, "first");
  assert.equal(registry.options?.reasoning, "high");
  assert.equal(registry.options?.maxTokens, undefined);
  assert.ok(registry.used && registry.context);
  const base = buildBaseOptions(
    registry.used,
    normalizeContext(registry.context),
    registry.options,
  );
  assert.equal(base.maxTokens, first.maxOutputTokens);
  await adapter.consult(second, request);
  assert.equal(registry.used?.id, "second");
  assert.equal(registry.options?.reasoning, "low");
  registry.window = 64_000;
  await assert.rejects(adapter.consult(first, request), /capacidades/);
}

test("resoluções intercaladas preservam modelo, opções e capacidades", resolvesIndependently);
