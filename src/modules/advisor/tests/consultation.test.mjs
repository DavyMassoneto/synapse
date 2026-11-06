import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { AdvisorService } = await jiti.import("../internal/service.ts");

function createAdvisor() {
  return new AdvisorService({
    load() {
      return { kind: "loaded", config: { model: "provider/first", thinking: "low" } };
    },
    save() {},
  });
}

test("a consulta preserva o snapshot durante alterações de configuração", async () => {
  const advisor = createAdvisor();
  let release;
  const waiting = new Promise((resolve) => {
    release = resolve;
  });
  let captured;
  const port = {
    async contextWindow(reference) {
      assert.equal(reference, "provider/first");
      await waiting;
      return 30_000;
    },
    async consult(request) {
      captured = request;
      return { kind: "success", text: "advice" };
    },
  };
  const pending = advisor.consult({ system: "", messages: [] }, port);
  advisor.selectModel("provider/second");
  advisor.setThinking("high");
  release();
  const result = await pending;
  assert.equal(result.kind, "success");
  assert.equal(result.model, "provider/first");
  assert.equal(captured.model, "provider/first");
  assert.equal(captured.thinking, "low");
});

test("cancelamento e falha são resultados distintos", async () => {
  const advisor = createAdvisor();
  const aborted = new AbortController();
  aborted.abort();
  let calls = 0;
  const port = {
    async contextWindow() {
      calls += 1;
      return 30_000;
    },
    async consult() {
      throw new Error("provider error");
    },
  };
  assert.deepEqual(
    await advisor.consult({ system: "", messages: [], signal: aborted.signal }, port),
    { kind: "cancelled" },
  );
  assert.equal(calls, 0);
  assert.deepEqual(await advisor.consult({ system: "", messages: [] }, port), {
    kind: "failure",
    message: "provider error",
  });
});
