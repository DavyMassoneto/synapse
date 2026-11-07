import assert from "node:assert/strict";
import { test } from "vitest";
import { buildTranscript } from "#synapse/modules/advisor/internal/format/index.js";
import { type TranscriptMessage } from "#synapse/modules/advisor/public/transcript/index.js";
import { AdvisorService, TestModel, TestStorage } from "./fixtures.ts";

function transcriptRespectsBudget(): void {
  const messages: TranscriptMessage[] = [
    { kind: "user", blocks: [{ kind: "text", text: "á".repeat(30_000) }] },
    { kind: "shell", hidden: true, command: "secret", blocks: [{ kind: "text", text: "hidden" }] },
    { kind: "toolResult", tool: "read", error: true, blocks: [{ kind: "text", text: "failed" }] },
    { kind: "user", blocks: [{ kind: "text", text: "MOST_RECENT" }] },
  ];
  const short = buildTranscript(messages, 200);
  assert.ok(short.includes("MOST_RECENT"));
  assert.ok(short.length <= 200);
  assert.ok(!short.includes("secret"));
  assert.equal(buildTranscript([], 200), "");
  assert.match(buildTranscript(messages.slice(1), 200), /tool_result read \(error\)/);

  const beginning: TranscriptMessage = {
    kind: "user",
    blocks: [{ kind: "text", text: "FIRST_MESSAGE" }],
  };
  const middle: TranscriptMessage = {
    kind: "user",
    blocks: [{ kind: "text", text: "middle".repeat(1000) }],
  };
  const ending: TranscriptMessage = {
    kind: "user",
    blocks: [{ kind: "text", text: "LAST_MESSAGE" }],
  };
  const trimmed = buildTranscript([beginning, middle, ending], 200);
  assert.ok(trimmed.includes("FIRST_MESSAGE"));
  assert.ok(trimmed.includes("LAST_MESSAGE"));
  assert.ok(trimmed.length <= 200);
  const oversizedLast: TranscriptMessage = {
    kind: "user",
    blocks: [{ kind: "text", text: "last".repeat(1000) }],
  };
  assert.ok(buildTranscript([beginning, oversizedLast], 200).length <= 200);
}

async function smallContextFails(): Promise<void> {
  const storage = new TestStorage();
  const advisor = new AdvisorService(storage, storage.load());
  const model = new TestModel(100);
  const result = await advisor.consult({ system: "", messages: [] }, model);
  assert.equal(result.kind, "failure");
  assert.equal(model.captured, undefined);
}

test("a transcrição trata conteúdo como dados e respeita o orçamento", transcriptRespectsBudget);
test("janela muito pequena retorna falha antes de chamar o modelo", smallContextFails);
