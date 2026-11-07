import assert from "node:assert/strict";
import { test } from "node:test";
import { AdvisorService, TestModel, TestStorage } from "./fixtures.ts";

async function snapshotIsStable() {
  const advisor = new AdvisorService(
    new TestStorage("provider/first"),
    new TestStorage("provider/first").load(),
  );
  const port = new TestModel();
  const gate = Promise.withResolvers<void>();
  port.gate = gate.promise;
  const pending = advisor.consult({ system: "", messages: [] }, port);
  advisor.selectModel("provider/second");
  advisor.setThinking("high");
  gate.resolve();
  const result = await pending;
  assert.equal(result.kind, "success");
  assert.equal(result.model, "provider/first");
  assert.equal(port.resolvedReference, "provider/first");
  assert.ok(port.resolved);
  assert.equal(port.resolved.reference, "provider/first");
  assert.equal(port.resolved.effectiveThinking, "low");
}

async function cancellationAndFailure() {
  const storage = new TestStorage();
  const advisor = new AdvisorService(storage, storage.load());
  const controller = new AbortController();
  controller.abort();
  const port = new TestModel();
  port.failure = true;
  assert.deepEqual(
    await advisor.consult({ system: "", messages: [], signal: controller.signal }, port),
    { kind: "cancelled" },
  );
  assert.equal(port.calls, 0);
  assert.deepEqual(await advisor.consult({ system: "", messages: [] }, port), {
    kind: "failure",
    message: "provider error",
  });
}

test("a consulta preserva o snapshot durante alterações de configuração", snapshotIsStable);
test("cancelamento e falha são resultados distintos", cancellationAndFailure);
