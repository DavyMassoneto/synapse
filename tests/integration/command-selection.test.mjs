import assert from "node:assert/strict";
import { test } from "node:test";
import { AdvisorHarness } from "#advisor-test-host";

class SelectionUI {
  selected = undefined;

  notify() {}
  setStatus() {}
  async select() {
    return this.selected;
  }
}

async function selectionAndCancellation() {
  const harness = new AdvisorHarness("stop");
  try {
    const ui = new SelectionUI();
    harness.context.hasUI = true;
    harness.context.ui = ui;
    harness.registry.getAvailable = getAvailable;

    ui.selected = "provider/other";
    await harness.command.handler("", harness.context);
    assert.equal(harness.advisor.status().config.model, "provider/other");

    ui.selected = undefined;
    await harness.command.handler("", harness.context);
    assert.equal(harness.advisor.status().config.model, "provider/other");

    ui.selected = "(sem advisor)";
    await harness.command.handler("", harness.context);
    assert.equal(harness.advisor.status().config.model, undefined);
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
