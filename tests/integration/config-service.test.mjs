import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { AdvisorService } = await jiti.import("../../src/modules/advisor/internal/service.ts");

test("falha de persistência preserva a configuração anterior", () => {
  const storage = {
    load() {
      return { kind: "loaded", config: { model: "provider/original", thinking: "low" } };
    },
    save() {
      throw new Error("disco indisponível");
    },
  };

  const advisor = new AdvisorService(storage);
  const invalidModel = advisor.selectModel("invalid");
  assert.equal(invalidModel.kind, "failure");
  const invalidThinking = advisor.setThinking("invalid");
  assert.equal(invalidThinking.kind, "failure");

  const result = advisor.selectModel("provider/novo");
  assert.equal(result.kind, "failure");
  assert.deepEqual(advisor.status(), {
    kind: "success",
    status: { model: "provider/original", thinking: "low" },
  });
});
