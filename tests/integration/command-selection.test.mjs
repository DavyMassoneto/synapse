import assert from "node:assert/strict";
import { test } from "node:test";
import { AdvisorHarness } from "#advisor-test-host";

async function selectionAndCancellation() {
  const harness = new AdvisorHarness("stop");
  try {
    let selected;
    harness.context.hasUI = true;
    harness.context.ui = {
      notify() {},
      setStatus() {},
      async select() {
        return selected;
      },
    };
    harness.registry.getAvailable = getAvailable;

    selected = "provider/other";
    await harness.command.handler("", harness.context);
    assert.equal(harness.advisor.status().status.model, "provider/other");

    selected = undefined;
    await harness.command.handler("", harness.context);
    assert.equal(harness.advisor.status().status.model, "provider/other");

    selected = "(sem advisor)";
    await harness.command.handler("", harness.context);
    assert.equal(harness.advisor.status().status.model, undefined);
  } finally {
    harness.cleanup();
  }
}

function getAvailable() {
  return [
    { provider: "provider", id: "model" },
    { provider: "provider", id: "other" },
  ];
}

test(
  "seleção, cancelamento e desligamento preservam a intenção do usuário",
  selectionAndCancellation,
);
