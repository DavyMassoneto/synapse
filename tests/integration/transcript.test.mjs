import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { buildTranscript } = await jiti.import(
  "../../src/modules/advisor/internal/format/transcript.ts",
);
const { AdvisorService } = await jiti.import("../../src/modules/advisor/internal/service.ts");

test("a transcrição trata conteúdo como dados e respeita o orçamento", () => {
  const messages = [
    { kind: "user", blocks: [{ kind: "text", text: "á".repeat(30_000) }] },
    { kind: "shell", hidden: true, name: "secret", blocks: [{ kind: "text", text: "hidden" }] },
    { kind: "toolResult", name: "read", error: true, blocks: [{ kind: "text", text: "failed" }] },
  ];
  const short = buildTranscript(messages, 200);
  assert.ok(short.length <= 200);
  assert.ok(!short.includes("secret"));
  assert.equal(buildTranscript([], 200), "");
  assert.match(buildTranscript(messages.slice(1), 200), /tool_result read \(error\)/);
});

test("janela muito pequena retorna falha antes de chamar o modelo", async () => {
  const advisor = new AdvisorService({
    load() {
      return { kind: "loaded", config: { model: "provider/model", thinking: "low" } };
    },
    save() {},
  });
  let called = false;
  const result = await advisor.consult(
    { system: "", messages: [] },
    {
      async contextWindow() {
        return 100;
      },
      async consult() {
        called = true;
        return { text: "unused" };
      },
    },
  );
  assert.equal(result.kind, "failure");
  assert.equal(called, false);
});
