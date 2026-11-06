import assert from "node:assert/strict";
import { test } from "node:test";
import { AdvisorHarness, usage } from "#advisor-test-host";

async function providerAbort() {
  const harness = new AdvisorHarness("aborted");
  try {
    const result = await harness.tool.execute("id", {}, undefined, undefined, harness.context);
    assert.match(result.content[0].text, /cancelada/);
  } finally {
    harness.cleanup();
  }
}

async function projectionFailure() {
  const harness = new AdvisorHarness("stop");
  try {
    harness.session.projectionError = true;
    const result = await harness.tool.execute("id", {}, undefined, undefined, harness.context);
    assert.match(result.content[0].text, /projection failed/);
    assert.equal(harness.registry.calls, 0);
  } finally {
    harness.cleanup();
  }
}

async function shutdown() {
  const harness = new AdvisorHarness("stop");
  try {
    harness.lifecycle.abort();
    harness.session.projectionError = true;
    const result = await harness.tool.execute("id", {}, undefined, undefined, harness.context);
    assert.match(result.content[0].text, /cancelada/);
    assert.equal(harness.registry.calls, 0);
  } finally {
    harness.cleanup();
  }
}

async function successfulConsultation() {
  const harness = new AdvisorHarness("stop");
  try {
    const result = await harness.tool.execute("id", {}, undefined, undefined, harness.context);
    assert.equal(result.content[0].text, "conselho");
    assert.equal(result.details.model, "provider/model");
    assert.deepEqual(result.usage, usage);
  } finally {
    harness.cleanup();
  }
}

test("resposta abortada do provedor é cancelamento", providerAbort);
test("falha de projeção não consulta o modelo", projectionFailure);
test("shutdown impede nova projeção e consulta", shutdown);
test("consulta bem-sucedida preserva modelo e uso", successfulConsultation);
