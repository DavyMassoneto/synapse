import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { compose } = await jiti.import("../../src/composition/compose.ts");

test("composição registra o advisor e coordena o encerramento", () => {
  let signal;
  let shutdown;
  const host = {
    register(advisor, lifecycleSignal, close) {
      assert.ok(advisor);
      signal = lifecycleSignal;
      shutdown = close;
    },
  };

  compose(host, "/nonexistent/synapse-advisor-config.json");
  assert.equal(signal.aborted, false);
  shutdown();
  assert.equal(signal.aborted, true);
});
