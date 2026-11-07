import assert from "node:assert/strict";
import { test } from "vitest";
import { TEST_USAGE, TestContext } from "../fixtures/typed-context.ts";
import { TypedAdvisorHost } from "../fixtures/typed-host.ts";

async function successfulConsultation(): Promise<void> {
  const host = new TypedAdvisorHost();
  const context = new TestContext();
  try {
    assert.ok(host.tool);
    const result = await host.tool.execute("id", {}, undefined, undefined, context);
    assert.equal(result.content[0].type, "text");
    assert.deepEqual(result.usage, TEST_USAGE);
    assert.equal(result.details?.model, "provider/model");
  } finally {
    host.cleanup();
  }
}

async function abortedProvider(): Promise<void> {
  const host = new TypedAdvisorHost();
  const context = new TestContext();
  context.modelRegistry.stopReason = "aborted";
  try {
    assert.ok(host.tool);
    const result = await host.tool.execute("id", {}, undefined, undefined, context);
    const content = result.content[0];
    assert.equal(content.type, "text");
    assert.match(content.text, /cancelada/);
  } finally {
    host.cleanup();
  }
}

async function projectionFailure(): Promise<void> {
  const host = new TypedAdvisorHost();
  const context = new TestContext();
  context.sessionManager.projectionError = true;
  try {
    assert.ok(host.tool);
    const result = await host.tool.execute("id", {}, undefined, undefined, context);
    const content = result.content[0];
    assert.equal(content.type, "text");
    assert.match(content.text, /projection failed/);
    assert.equal(context.modelRegistry.calls, 0);
  } finally {
    host.cleanup();
  }
}

async function registeredShutdown(): Promise<void> {
  const host = new TypedAdvisorHost();
  const context = new TestContext();
  try {
    for (const handler of host.shutdowns) {
      await handler({ type: "session_shutdown", reason: "quit" }, context);
    }
    assert.ok(host.tool);
    const result = await host.tool.execute("id", {}, undefined, undefined, context);
    const content = result.content[0];
    assert.equal(content.type, "text");
    assert.match(content.text, /cancelada/);
    assert.equal(context.modelRegistry.calls, 0);
  } finally {
    host.cleanup();
  }
}

test("consulta registrada preserva uso e modelo", successfulConsultation);
test("provedor abortado devolve cancelamento", abortedProvider);
test("falha de projeção não consulta provedor", projectionFailure);
test("shutdown registrado impede consulta", registeredShutdown);
