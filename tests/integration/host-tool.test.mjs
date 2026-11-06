import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { registerAdvisor } = await jiti.import("../../src/integration/pi/advisor/advisor.ts");
const { AdvisorService } = await jiti.import("../../src/modules/advisor/internal/service.ts");

function createHarness(stopReason) {
  const handlers = new Map();
  let tool;
  let calls = 0;
  let projectionError = false;
  const advisor = new AdvisorService({
    load() {
      return { kind: "loaded", config: { model: "provider/model", thinking: "low" } };
    },
    save() {},
  });
  const host = {
    on(name, handler) {
      const entries = handlers.get(name) ?? [];
      entries.push(handler);
      handlers.set(name, entries);
    },
    registerTool(definition) {
      tool = definition;
    },
    registerCommand() {},
    getActiveTools() {
      return [];
    },
    setActiveTools() {},
  };
  const model = { provider: "provider", id: "model", contextWindow: 40_000, reasoning: true };
  const context = {
    hasUI: false,
    scopedModels: [],
    getSystemPrompt() {
      return "system";
    },
    sessionManager: {
      buildSessionProjection() {
        if (projectionError) {
          throw new Error("projection failed");
        }
        return { messages: [] };
      },
    },
    modelRegistry: {
      find() {
        calls += 1;
        return model;
      },
      hasConfiguredAuth() {
        return true;
      },
      streamSimple() {
        return {
          async result() {
            return { stopReason, content: [], errorMessage: "stopped" };
          },
        };
      },
    },
  };
  const lifecycle = new AbortController();
  registerAdvisor(host, advisor, lifecycle.signal, lifecycle.abort.bind(lifecycle));
  return {
    tool,
    context,
    lifecycle,
    getCalls() {
      return calls;
    },
    failProjection() {
      projectionError = true;
    },
  };
}

test("resposta abortada do provedor é cancelamento", async () => {
  const harness = createHarness("aborted");
  const result = await harness.tool.execute("id", {}, undefined, undefined, harness.context);
  assert.match(result.content[0].text, /cancelada/);
});

test("falha de projeção não consulta o modelo", async () => {
  const harness = createHarness("stop");
  harness.failProjection();
  const result = await harness.tool.execute("id", {}, undefined, undefined, harness.context);
  assert.match(result.content[0].text, /projection failed/);
  assert.equal(harness.getCalls(), 0);
});

test("shutdown impede nova projeção e consulta", async () => {
  const harness = createHarness("stop");
  harness.lifecycle.abort();
  harness.failProjection();
  const result = await harness.tool.execute("id", {}, undefined, undefined, harness.context);
  assert.match(result.content[0].text, /cancelada/);
  assert.equal(harness.getCalls(), 0);
});
