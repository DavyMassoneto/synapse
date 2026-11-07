import { expect, test } from "vitest";
import { AdvisorService } from "../internal";
import { TestStorage } from "./test-storage";

function invalidModelDoesNotSave(): void {
  const storage = new TestStorage();
  const advisor = new AdvisorService(storage, storage.load());
  expect(advisor.configuration.selectModel("invalid").kind).toBe("failure");
  expect(storage.saves).toBe(0);
}

function invalidThinkingDoesNotSave(): void {
  const storage = new TestStorage();
  const advisor = new AdvisorService(storage, storage.load());
  expect(advisor.configuration.setThinking("invalid").kind).toBe("failure");
  expect(storage.saves).toBe(0);
}

function failedSavePreservesState(): void {
  const storage = new TestStorage("provider/original");
  storage.failSave = true;
  const advisor = new AdvisorService(storage, storage.load());
  expect(storage.loads).toBe(1);
  expect(advisor.configuration.selectModel("provider/novo").kind).toBe("failure");
  expect(advisor.configuration.status()).toStrictEqual({
    kind: "success",
    config: { model: "provider/original", thinking: "low" },
  });
}

test("modelo inválido não é salvo", invalidModelDoesNotSave);
test("nível inválido não é salvo", invalidThinkingDoesNotSave);
test("falha de persistência preserva a configuração anterior", failedSavePreservesState);
