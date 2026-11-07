import assert from "node:assert/strict";
import { test } from "vitest";
import { TestContext, TypedAdvisorHost } from "../fixtures/index.js";

async function selectionAndCancellation(): Promise<void> {
  const host = new TypedAdvisorHost();
  const context = new TestContext();
  context.hasUI = true;

  try {
    assert.ok(host.command);
    context.ui.selection = "provider/other";
    await host.command.handler("", context);
    let status = host.advisor.status();
    assert.equal(status.kind, "success");
    assert.equal(status.config.model, "provider/other");

    context.ui.selection = undefined;
    await host.command.handler("", context);
    status = host.advisor.status();
    assert.equal(status.kind, "success");
    assert.equal(status.config.model, "provider/other");

    context.ui.selection = "(sem advisor)";
    await host.command.handler("", context);
    status = host.advisor.status();
    assert.equal(status.kind, "success");
    assert.equal(status.config.model, undefined);
  } finally {
    host.cleanup();
  }
}

test("seleção, cancelamento e desligamento preservam intenção", selectionAndCancellation);
