import assert from "node:assert/strict";
import { test } from "vitest";
import {
  AdvisorService,
  CancelledModel,
  CancelOnConsultModel,
  CancelOnResolveModel,
  TestStorage,
} from "./fixtures.ts";

async function cancellationDuringResolution() {
  const storage = new TestStorage();
  const advisor = new AdvisorService(storage, storage.load());
  const controller = new AbortController();
  const port = new CancelOnResolveModel(controller);
  const result = await advisor.consult(
    { system: "", messages: [], signal: controller.signal },
    port,
  );
  assert.equal(result.kind, "cancelled");
  assert.equal(port.captured, undefined);
}

async function cancellationDuringExecution() {
  const storage = new TestStorage();
  const advisor = new AdvisorService(storage, storage.load());
  const controller = new AbortController();
  const port = new CancelOnConsultModel(controller);
  const result = await advisor.consult(
    { system: "", messages: [], signal: controller.signal },
    port,
  );
  assert.equal(result.kind, "cancelled");
}

async function cancellationFromProvider() {
  const storage = new TestStorage();
  const advisor = new AdvisorService(storage, storage.load());
  const port = new CancelledModel();
  const result = await advisor.consult({ system: "", messages: [] }, port);
  assert.equal(result.kind, "cancelled");
}

test("cancelamento durante resolução impede execução", cancellationDuringResolution);
test("cancelamento durante execução é distinguido de falha", cancellationDuringExecution);
test("porta cancelada sem sinal externo é cancelamento", cancellationFromProvider);
