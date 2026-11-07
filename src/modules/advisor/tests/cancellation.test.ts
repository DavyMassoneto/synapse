import assert from "node:assert/strict";
import { test } from "node:test";
import { AdvisorService, TestModel, TestStorage } from "./fixtures.ts";

async function cancellationDuringResolution() {
  const advisor = new AdvisorService(new TestStorage());
  const controller = new AbortController();
  const port = new TestModel();
  port.controller = controller;
  port.cancelAt = "resolve";
  const result = await advisor.consult(
    { system: "", messages: [], signal: controller.signal },
    port,
  );
  assert.equal(result.kind, "cancelled");
  assert.equal(port.captured, undefined);
}

async function cancellationDuringExecution() {
  const advisor = new AdvisorService(new TestStorage());
  const controller = new AbortController();
  const port = new TestModel();
  port.controller = controller;
  port.cancelAt = "execute";
  const result = await advisor.consult(
    { system: "", messages: [], signal: controller.signal },
    port,
  );
  assert.equal(result.kind, "cancelled");
}

async function cancellationFromProvider() {
  const advisor = new AdvisorService(new TestStorage());
  const port = new TestModel();
  port.cancelled = true;
  const result = await advisor.consult({ system: "", messages: [] }, port);
  assert.equal(result.kind, "cancelled");
}

test("cancelamento durante resolução impede execução", cancellationDuringResolution);
test("cancelamento durante execução é distinguido de falha", cancellationDuringExecution);
test("porta cancelada sem sinal externo é cancelamento", cancellationFromProvider);
