import { describe, expect, test } from "vitest";
import { captureTranscript } from "#synapse/integration";
import { TestContext } from "../fixtures";

function preservesProjectedMessages(): void {
  const context = new TestContext();
  context.sessionManager.messages = [
    {
      role: "user",
      content: [
        { type: "text", text: "pedido" },
        { type: "image", data: "AA==", mimeType: "image/png" },
      ],
      timestamp: 0,
    },
    {
      role: "toolResult",
      toolCallId: "id",
      toolName: "read",
      content: [{ type: "text", text: "falhou" }],
      isError: true,
      timestamp: 1,
    },
  ];
  expect(captureTranscript(context)).toStrictEqual([
    { kind: "user", blocks: [{ kind: "text", text: "pedido" }, { kind: "image" }] },
    { kind: "toolResult", tool: "read", error: true, blocks: [{ kind: "text", text: "falhou" }] },
  ]);
}

function registerTests(): void {
  test("captura mensagens e imagens sem alterar ordem", preservesProjectedMessages);
}

describe("transcript projection", registerTests);
