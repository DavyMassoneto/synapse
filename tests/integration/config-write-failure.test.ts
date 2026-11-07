import assert from "node:assert/strict";
import { mkdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "vitest";
import { TestContext, TypedAdvisorHost } from "../fixtures/index.js";

async function reportWriteFailure(): Promise<void> {
  const host = new TypedAdvisorHost();
  const context = new TestContext();
  const path = join(host.directory, "advisor.json");

  try {
    unlinkSync(path);
    mkdirSync(path);
    writeFileSync(join(path, "keep"), "original");
    assert.ok(host.command);
    await host.command.handler("thinking high", context);
    assert.match(context.ui.notices.at(-1) ?? "", /salvar/);
    assert.equal(context.ui.notices.length, 1);
    assert.doesNotMatch(context.ui.notices[0], /Advisor thinking: high/);
    const status = host.advisor.status();
    assert.equal(status.kind, "success");
    assert.equal(status.config.thinking, "low");
    assert.equal(host.advisor.isEnabled(), true);
  } finally {
    rmSync(path, { recursive: true, force: true });
    host.cleanup();
  }
}

test("falha ao salvar pelo comando preserva o estado e informa o erro", reportWriteFailure);
