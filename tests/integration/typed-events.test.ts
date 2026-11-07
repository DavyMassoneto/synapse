import assert from "node:assert/strict";
import {
  type BeforeAgentStartEvent,
  type TurnEndEvent,
  type TurnEndEventResult,
} from "@earendil-works/pi-coding-agent";
import { test } from "vitest";
import { TestContext } from "../fixtures/typed-context.ts";
import { TypedAdvisorHost } from "../fixtures/typed-host.ts";

async function eventLifecycle(): Promise<void> {
  const host = new TypedAdvisorHost();
  const context = new TestContext();
  const start: BeforeAgentStartEvent = {
    type: "before_agent_start",
    messageType: "user",
    prompt: "hello",
    systemPrompt: "system",
    systemPromptOptions: {
      cwd: ".",
      selectedTools: [],
      hiddenTools: [],
      toolSnippets: {},
      toolGuidelines: {},
      promptGuidelines: [],
      appendSystemPrompt: "",
      sections: {},
      contextFiles: [],
      skills: [],
    },
  };
  const turn: TurnEndEvent = {
    type: "turn_end",
    turnIndex: 0,
    message: { role: "user", content: "hello", timestamp: 0 },
    toolResults: [
      {
        role: "toolResult",
        toolCallId: "id",
        toolName: "read",
        content: [],
        isError: false,
        timestamp: 0,
      },
    ],
    messageEntryId: "entry",
    toolResultEntryIds: [],
    entries: [],
    continue: false,
    outcome: "completed",
    context: {
      contextEntries: [],
      contextMessages: [],
      llmMessages: [],
      pendingMessages: [],
      canContinue: true,
    },
  };

  try {
    for (const handler of host.starts) {
      await handler({ type: "session_start", reason: "startup" }, context);
    }
    assert.ok(host.advisor.isEnabled());
    assert.ok(host.active.includes("advisor"));
    for (const handler of host.beforeStarts) {
      await handler(start, context);
    }
    assert.ok(start.systemPromptOptions.sections.advisor);

    let reminder: TurnEndEventResult | undefined;
    for (let index = 0; index < 4; index++) {
      for (const handler of host.turns) {
        reminder = await handler(turn, context);
      }
      assert.equal(reminder, undefined);
    }
    for (const handler of host.turns) {
      reminder = await handler(turn, context);
    }
    assert.ok(reminder?.entries?.length);
    const entry = reminder.entries.at(-1);
    assert.equal(entry?.type, "custom_message");
    assert.equal(entry.customType, "advisor-reminder");

    for (let index = 0; index < 4; index++) {
      for (const handler of host.turns) {
        await handler(turn, context);
      }
    }
    for (const handler of host.toolResults) {
      await handler(
        {
          type: "tool_result",
          toolCallId: "advisor",
          toolName: "advisor",
          input: {},
          content: [],
          details: {},
          isError: false,
        },
        context,
      );
    }
    for (const handler of host.turns) {
      reminder = await handler(turn, context);
    }
    assert.equal(reminder, undefined);

    host.advisor.disable();
    assert.equal(host.advisor.isEnabled(), false);
    for (const handler of host.beforeStarts) {
      await handler(start, context);
    }
    assert.equal(start.systemPromptOptions.sections.advisor, undefined);
    assert.ok(!host.active.includes("advisor"));
  } finally {
    host.cleanup();
  }
}

test("eventos registrados controlam ferramenta, instruções e lembretes", eventLifecycle);
