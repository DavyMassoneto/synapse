import assert from "node:assert/strict";
import { test } from "node:test";
import { AdvisorService, TestStorage } from "./fixtures.ts";

function failedSavePreservesState() {
  const storage = new TestStorage("provider/original");
  storage.failSave = true;
  const loaded = storage.load();
  const advisor = new AdvisorService(storage, loaded);
  assert.equal(storage.loads, 1);
  assert.equal(advisor.selectModel("invalid").kind, "failure");
  assert.equal(advisor.setThinking("invalid").kind, "failure");
  assert.equal(storage.saves, 0);
  assert.equal(advisor.selectModel("provider/novo").kind, "failure");
  assert.deepEqual(advisor.status(), {
    kind: "success",
    config: { model: "provider/original", thinking: "low" },
  });
}

test("falha de persistência preserva a configuração anterior", failedSavePreservesState);
