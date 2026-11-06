import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { AdvisorService, TestModel, TestStorage } from "#advisor-test-module";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { buildTranscript } = await jiti.import("../internal/format/transcript.ts");
const { AdvisorModel } = await jiti.import("../../../integration/pi/advisor/model.ts");

function originalTaskAndGap() {
  const task = "TAREFA_ORIGINAL " + "x".repeat(300);
  const messages = [{ kind: "user", blocks: [{ kind: "text", text: task }] }];
  for (let index = 0; index < 5; index++) {
    messages.push({ kind: "assistant", blocks: [{ kind: "text", text: "MID" + index + "y".repeat(150) }] });
  }
  messages.push({ kind: "user", blocks: [{ kind: "text", text: "ULTIMA " + "z".repeat(400) }] });
  const result = buildTranscript(messages, 700);
  assert.ok(result.includes(task));
  assert.ok(result.indexOf(task) < result.indexOf("mensagens anteriores omitidas"));
  assert.ok(result.indexOf("mensagens anteriores omitidas") < result.indexOf("ULTIMA"));
  assert.ok(result.length <= 700);
}

async function responseReservation() {
  const advisor = new AdvisorService(new TestStorage());
  const port = new TestModel();
  port.window = 32_000;
  const input = { system: "", messages: [{ kind: "user", blocks: [{ kind: "text", text: "x".repeat(150_000) }] }] };
  const result = await advisor.consult(input, port);
  assert.equal(result.kind, "success");
  const estimatedInputTokens = Math.ceil((port.captured.system.length + port.captured.prompt.length) / 3.5);
  assert.ok(port.window - estimatedInputTokens - 4096 >= 8192);
}

class RegistryFixture {
  find(provider, id) { return { provider, id, contextWindow: 40_000, reasoning: false }; }
  hasConfiguredAuth() { return true; }
  streamSimple(model) { this.used = model; return this; }
  async result() { return { stopReason: "stop", content: [{ type: "text", text: "ok" }], usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } } }; }
}

async function modelReferenceCannotChange() {
  const registry = new RegistryFixture();
  const adapter = new AdvisorModel({ modelRegistry: registry });
  await adapter.contextWindow("provider/first");
  await assert.rejects(adapter.consult({ system: "", prompt: "", model: "provider/second", thinking: "off" }));
  assert.equal(registry.used, undefined);
}

test("reserva tarefa original antes da lacuna e mensagens recentes", originalTaskAndGap);
test("reserva tokens de resposta compatíveis com janela de 32k", responseReservation);
test("não executa modelo diferente do informado", modelReferenceCannotChange);
