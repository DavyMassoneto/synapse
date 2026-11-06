import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { compose } = await jiti.import("../../src/composition");

class HostFixture {
  register(advisor, signal, shutdown) {
    assert.ok(advisor);
    this.signal = signal;
    this.shutdown = shutdown;
  }
}

function compositionLifecycle() {
  const host = new HostFixture();
  compose(host, "/nonexistent/synapse-advisor-config.json");
  assert.equal(host.signal.aborted, false);
  host.shutdown();
  assert.equal(host.signal.aborted, true);
}

test("composição registra o advisor e coordena o encerramento", compositionLifecycle);
