import assert from "node:assert/strict";
import { test } from "vitest";
import { buildTranscript } from "#synapse/modules/advisor/internal/format/index.js";
import { type TranscriptMessage } from "#synapse/modules/advisor/public/transcript/index.js";

function originalTaskAndGap(): void {
  const task = `TAREFA_ORIGINAL ${"x".repeat(300)}`;
  const messages: TranscriptMessage[] = [{ kind: "user", blocks: [{ kind: "text", text: task }] }];

  for (let index = 0; index < 5; index++) {
    messages.push({
      kind: "assistant",
      blocks: [{ kind: "text", text: `MID${index}${"y".repeat(150)}` }],
    });
  }
  messages.push({ kind: "user", blocks: [{ kind: "text", text: `ULTIMA ${"z".repeat(400)}` }] });

  const result = buildTranscript(messages, 700);
  assert.ok(result.includes(task));
  assert.ok(result.indexOf(task) < result.indexOf("mensagens anteriores omitidas"));
  assert.ok(result.indexOf("mensagens anteriores omitidas") < result.indexOf("ULTIMA"));
  assert.ok(result.length <= 700);
}

test("preserva tarefa original antes da lacuna e mensagens recentes", originalTaskAndGap);
