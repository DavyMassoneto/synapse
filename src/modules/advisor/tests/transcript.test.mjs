import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { buildTranscript } = await jiti.import("../internal/format/transcript.ts");
const { AdvisorService } = await jiti.import("../internal/service.ts");

test("a transcrição trata conteúdo como dados e respeita o orçamento", () => {
  const messages = [
    { kind: "user", blocks: [{ kind: "text", text: "á".repeat(30_000) }] },
    { kind: "shell", hidden: true, name: "secret", blocks: [{ kind: "text", text: "hidden" }] },
    { kind: "toolResult", name: "read", error: true, blocks: [{ kind: "text", text: "failed" }] },
  ];
  messages.push({ kind: "user", blocks: [{ kind: "text", text: "MOST_RECENT" }] });
  const short = buildTranscript(messages, 200);
  assert.ok(short.includes("MOST_RECENT"));
  assert.ok(short.length <= 200);
  assert.ok(!short.includes("secret"));
  assert.equal(buildTranscript([], 200), "");
  assert.match(buildTranscript(messages.slice(1), 200), /tool_result read \(error\)/);

  const beginning = { kind: "user", blocks: [{ kind: "text", text: "FIRST_MESSAGE" }] };
  const middle = { kind: "user", blocks: [{ kind: "text", text: "middle".repeat(1000) }] };
  const ending = { kind: "user", blocks: [{ kind: "text", text: "LAST_MESSAGE" }] };
  const trimmed = buildTranscript([beginning, middle, ending], 200);
  assert.ok(trimmed.includes("FIRST_MESSAGE"));
  assert.ok(trimmed.includes("LAST_MESSAGE"));
  assert.ok(trimmed.length <= 200);

  const oversizedLast = { kind: "user", blocks: [{ kind: "text", text: "last".repeat(1000) }] };
  const bounded = buildTranscript([beginning, oversizedLast], 200);
  assert.ok(bounded.length <= 200);
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
        return { kind: "success", text: "unused" };
      },
    },
  );
  assert.equal(result.kind, "failure");
  assert.equal(called, false);
});
