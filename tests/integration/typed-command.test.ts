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
    assert.match(context.ui.notices.at(-1) ?? "", /inválido/);
    await host.command.handler("thinking banana", context);
    assert.match(context.ui.notices.at(-1) ?? "", /inválido/);
    await host.command.handler("thinkingx", context);
    let status = host.advisor.status();
    assert.equal(status.kind, "success");
    assert.equal(status.config.model, "provider/thinkingx");

    await host.command.handler("provider/model", context);
    status = host.advisor.status();
    assert.equal(status.kind, "success");
    assert.equal(status.config.model, "provider/model");

    await host.command.handler("provider", context);
    assert.match(context.ui.notices.at(-1) ?? "", /Mais de um modelo/);
    status = host.advisor.status();
    assert.equal(status.kind, "success");
    assert.equal(status.config.model, "provider/model");
  } finally {
    host.cleanup();
  }
}

test("parser distingue thinking de referências de modelo", commandParsing);
