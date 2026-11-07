import assert from "node:assert/strict";
import { test } from "node:test";
import { TestContext } from "../fixtures/typed-context.ts";
import { TypedAdvisorHost } from "../fixtures/typed-host.ts";

async function commandParsing(): Promise<void> {
  const host = new TypedAdvisorHost();
  const context = new TestContext();
  try {
    assert.ok(host.command);
    await host.command.handler("thinking", context);
    assert.match(context.ui.notices.at(-1) ?? "", /Níveis/);
    await host.command.handler("thinking banana", context);
    assert.match(context.ui.notices.at(-1) ?? "", /Níveis/);
    await host.command.handler("thinkingx", context);
    assert.match(context.ui.notices.at(-1) ?? "", /Nenhum modelo/);
    assert.equal(host.advisor.status().kind, "success");
  } finally {
    host.cleanup();
  }
}

test("parser distingue thinking de referências de modelo", commandParsing);
