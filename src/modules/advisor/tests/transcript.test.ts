import { describe, expect, test } from "vitest";
import { AdvisorService, buildTranscript } from "../internal";
import type { TranscriptMessage } from "../public";
import { TestModel } from "./test-model";
import { TestStorage } from "./test-storage";

function emptyTranscript(): void {
  expect(buildTranscript([], 200)).toBe("");
}

function hiddenShell(): void {
  const messages: TranscriptMessage[] = [
    { kind: "shell", hidden: true, command: "secret", blocks: [{ kind: "text", text: "hidden" }] },
  ];
  expect(buildTranscript(messages, 200)).not.toContain("secret");
}

function toolErrorLabel(): void {
  const messages: TranscriptMessage[] = [
    { kind: "toolResult", tool: "read", error: true, blocks: [{ kind: "text", text: "failed" }] },
  ];
  expect(buildTranscript(messages, 200)).toMatch(/tool_result read \(error\)/);
}

function recentMessageFits(): void {
  const messages: TranscriptMessage[] = [
    { kind: "user", blocks: [{ kind: "text", text: "á".repeat(30_000) }] },
    { kind: "user", blocks: [{ kind: "text", text: "MOST_RECENT" }] },
  ];
  const text = buildTranscript(messages, 200);
  expect(text).toContain("MOST_RECENT");
  expect(text.length).toBeLessThanOrEqual(200);
}

function preservesBeginningAndEnd(): void {
  const messages: TranscriptMessage[] = [
    { kind: "user", blocks: [{ kind: "text", text: "FIRST_MESSAGE" }] },
    { kind: "user", blocks: [{ kind: "text", text: "middle".repeat(1000) }] },
    { kind: "user", blocks: [{ kind: "text", text: "LAST_MESSAGE" }] },
  ];
  const text = buildTranscript(messages, 200);
  expect(text).toContain("FIRST_MESSAGE");
  expect(text).toContain("LAST_MESSAGE");
  expect(text.length).toBeLessThanOrEqual(200);
}

function oversizedLastFits(): void {
  const messages: TranscriptMessage[] = [
    { kind: "user", blocks: [{ kind: "text", text: "FIRST_MESSAGE" }] },
    { kind: "user", blocks: [{ kind: "text", text: "last".repeat(1000) }] },
  ];
  expect(buildTranscript(messages, 200).length).toBeLessThanOrEqual(200);
}

async function smallContextFails(): Promise<void> {
  const storage = new TestStorage();
  const advisor = new AdvisorService(storage, storage.load());
  const model = new TestModel(100);
  const result = await advisor.consult({ system: "", messages: [] }, model);
  expect(result.kind).toBe("failure");
  expect(model.captured).toBeUndefined();
}

function registerTests(): void {
  test("transcrição vazia", emptyTranscript);
  test("shell oculto não aparece na transcrição", hiddenShell);
  test("resultado de ferramenta identifica erro", toolErrorLabel);
  test("mensagem recente cabe no orçamento", recentMessageFits);
  test("início e fim são preservados", preservesBeginningAndEnd);
  test("última mensagem excessiva respeita orçamento", oversizedLastFits);
  test("janela muito pequena retorna falha antes de chamar o modelo", smallContextFails);
}

describe("transcript", registerTests);
