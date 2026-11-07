import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { buildTranscript } = await jiti.import("../internal/format/transcript.ts");

import { AdvisorService, TestModel, TestStorage } from "#advisor-test-module";

function transcriptRespectsBudget() {
  const messages = [
    { kind: "user", blocks: [{ kind: "text", text: "á".repeat(30_000) }] },
    { kind: "shell", hidden: true, command: "secret", blocks: [{ kind: "text", text: "hidden" }] },
    { kind: "toolResult", tool: "read", error: true, blocks: [{ kind: "text", text: "failed" }] },
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
}

async function smallContextFails() {
  const advisor = new AdvisorService(new TestStorage());
  const model = new TestModel();
  model.window = 100;
  const result = await advisor.consult({ system: "", messages: [] }, model);
  assert.equal(result.kind, "failure");
  assert.equal(model.captured, undefined);
}

test("a transcrição trata conteúdo como dados e respeita o orçamento", transcriptRespectsBudget);
test("janela muito pequena retorna falha antes de chamar o modelo", smallContextFails);
