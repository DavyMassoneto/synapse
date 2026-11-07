import { expect, test } from "vitest";
import { AdvisorService } from "../internal";
import { BudgetModel } from "./budget-model";
import { TestStorage } from "./test-storage";

async function rejectInsufficientWindows(contextWindow: number): Promise<void> {
  const storage = new TestStorage("provider/model", "high");
  const advisor = new AdvisorService(storage, storage.load());
  const port = new BudgetModel({
    reference: "provider/model",
    contextWindow,
    maxOutputTokens: 32_000,
    reasoningTokens: 16_384,
    effectiveThinking: "high",
  });
  const result = await advisor.consult({ system: "", messages: [] }, port);
  expect(result.kind).toBe("failure");
  expect(port.calls).toBe(1);
  expect(port.captured).toBeUndefined();
}

async function reserveFullOutput(): Promise<void> {
  const storage = new TestStorage("provider/model", "high");
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
  expect(result.kind).toBe("success");
  if (!port.captured) {
    throw new Error("requisição ausente");
  }
  const estimatedInput =
    Math.ceil(port.captured.system.length / 3) + Math.ceil(port.captured.prompt.length / 3);
  expect(estimatedInput + 4_096 + 32_000).toBeLessThanOrEqual(128_000);
}

async function noReasoningFits(): Promise<void> {
  const storage = new TestStorage("provider/model", "high");
  const advisor = new AdvisorService(storage, storage.load());
  const port = new BudgetModel({
    reference: "provider/model",
    contextWindow: 16_000,
    maxOutputTokens: 2_048,
    reasoningTokens: 0,
    effectiveThinking: "off",
  });
  const result = await advisor.consult({ system: "", messages: [] }, port);
  expect(result.kind).toBe("success");
}

test.each([16_000, 32_000])(
  "rejeita contexto %i incapaz de reservar saída",
  rejectInsufficientWindows,
);
test("reserva o teto de saída do advisor", reserveFullOutput);
test("modelo sem raciocínio usa capacidade disponível", noReasoningFits);
