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
      return { kind: "loaded", config: { model: "provider/model", thinking: "low" } };
    },
    save() {},
  });
}

test("cancelamento durante resolução impede execução", async () => {
  const advisor = createAdvisor();
  const controller = new AbortController();
  let called = false;
  const port = {
    async contextWindow() {
      controller.abort();
      return 40_000;
    },
    async consult() {
      called = true;
      return { kind: "success", text: "ignored" };
    },
  };
  const result = await advisor.consult(
    { system: "", messages: [], signal: controller.signal },
    port,
  );
  assert.equal(result.kind, "cancelled");
  assert.equal(called, false);
});

test("cancelamento durante execução é distinguido de falha", async () => {
  const advisor = createAdvisor();
  const controller = new AbortController();
  const port = {
    async contextWindow() {
      return 40_000;
    },
    async consult() {
      controller.abort();
      return { kind: "success", text: "ignored" };
    },
  };
  const result = await advisor.consult(
    { system: "", messages: [], signal: controller.signal },
    port,
  );
  assert.equal(result.kind, "cancelled");
});

test("porta cancelada sem sinal externo é cancelamento", async () => {
  const advisor = createAdvisor();
  const port = {
    async contextWindow() {
      return 40_000;
    },
    async consult() {
      return { kind: "cancelled" };
    },
  };
  const result = await advisor.consult({ system: "", messages: [] }, port);
  assert.equal(result.kind, "cancelled");
});
