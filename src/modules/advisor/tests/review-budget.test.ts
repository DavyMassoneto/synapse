import assert from "node:assert/strict";
import { test } from "node:test";
import { AdvisorService } from "@/modules/advisor/internal";
import { type ConfigLoadResult, type ConfigPort } from "@/modules/advisor/internal/config";
import { type ThinkingLevel } from "@/modules/advisor/public/config";
import {
  type ModelPort,
  type ModelRequest,
  type ModelResponse,
  type ResolvedModel,
} from "@/modules/advisor/public/consultation";

class Storage implements ConfigPort {
  load(): ConfigLoadResult {
    return { kind: "loaded", config: { model: "provider/model", thinking: "high" } };
  }
  save(): void {}
}

class BudgetModel implements ModelPort {
  request: ModelRequest | undefined;

  constructor(private readonly descriptor: ResolvedModel) {}

  async resolve(_reference: string, _thinking: ThinkingLevel): Promise<ResolvedModel> {
    return this.descriptor;
  }

  async consult(_resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    this.request = request;
    return { kind: "success", text: "ok" };
  }
}

async function rejectInsufficientWindows(): Promise<void> {
  const storage = new Storage();
  const advisor = new AdvisorService(storage, storage.load());
  for (const contextWindow of [16_000, 32_000]) {
    const port = new BudgetModel({
      reference: "provider/model",
      contextWindow,
      maxOutputTokens: 32_000,
      reasoningTokens: 16_384,
      effectiveThinking: "high",
    });
    const result = await advisor.consult({ system: "", messages: [] }, port);
    assert.equal(result.kind, "failure");
    assert.equal(port.request, undefined);
  }
}

async function reserveFullOutput(): Promise<void> {
  const storage = new Storage();
  const advisor = new AdvisorService(storage, storage.load());
  const port = new BudgetModel({
    reference: "provider/model",
    contextWindow: 128_000,
    maxOutputTokens: 32_000,
    reasoningTokens: 16_384,
    effectiveThinking: "high",
  });
  const result = await advisor.consult(
    {
      system: "",
      messages: [{ kind: "user", blocks: [{ kind: "text", text: "x".repeat(300_000) }] }],
    },
    port,
  );
  assert.equal(result.kind, "success");
  assert.ok(port.request);
  const estimatedInput =
    Math.ceil(port.request.system.length / 3.5) + Math.ceil(port.request.prompt.length / 3.5);
  assert.ok(estimatedInput + 4_096 + 32_000 <= 128_000);
}

async function noReasoningFits(): Promise<void> {
  const storage = new Storage();
  const advisor = new AdvisorService(storage, storage.load());
  const port = new BudgetModel({
    reference: "provider/model",
    contextWindow: 16_000,
    maxOutputTokens: 2_048,
    reasoningTokens: 0,
    effectiveThinking: "off",
  });
  const result = await advisor.consult({ system: "", messages: [] }, port);
  assert.equal(result.kind, "success");
}

test("rejeita contextos incapazes de reservar saída", rejectInsufficientWindows);
test("reserva o teto de saída do advisor", reserveFullOutput);
test("modelo sem raciocínio usa capacidade disponível", noReasoningFits);
