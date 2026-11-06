import assert from "node:assert/strict";
import { test } from "node:test";
import { AdvisorService, TestStorage } from "#advisor-test-module";

function failedSavePreservesState() {
  const storage = new TestStorage("provider/original");
  storage.failSave = true;
  const advisor = new AdvisorService(storage);
  assert.equal(advisor.selectModel("invalid").kind, "failure");
  assert.equal(advisor.setThinking("invalid").kind, "failure");
  assert.equal(advisor.selectModel("provider/novo").kind, "failure");
  assert.deepEqual(advisor.status(), {
    kind: "success",
    status: { model: "provider/original", thinking: "low" },
  });
}

test("falha de persistência preserva a configuração anterior", failedSavePreservesState);
