import { expect, test } from "vitest";
import { AdvisorService } from "../internal";
import { CancelOnConsultModel } from "./cancel-on-consult-model";
import { CancelOnResolveModel } from "./cancel-on-resolve-model";
import { CancelledModel } from "./cancelled-model";
import { TestStorage } from "./test-storage";

async function cancellationDuringResolution() {
  const storage = new TestStorage();
  const advisor = new AdvisorService(storage, storage.load());
  const controller = new AbortController();
  const port = new CancelOnResolveModel(controller);
  const result = await advisor.consult(
    { system: "", messages: [], signal: controller.signal },
    port,
  );
  expect(result.kind).toBe("cancelled");
  expect(port.captured).toBeUndefined();
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
  expect(result.kind).toBe("cancelled");
}

async function cancellationFromProvider() {
  const storage = new TestStorage();
  const advisor = new AdvisorService(storage, storage.load());
  const result = await advisor.consult({ system: "", messages: [] }, new CancelledModel());
  expect(result.kind).toBe("cancelled");
}

test("cancelamento durante resolução impede execução", cancellationDuringResolution);
test("cancelamento durante execução é distinguido de falha", cancellationDuringExecution);
test("porta cancelada sem sinal externo é cancelamento", cancellationFromProvider);
