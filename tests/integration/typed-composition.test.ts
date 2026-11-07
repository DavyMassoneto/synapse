import assert from "node:assert/strict";
import { test } from "node:test";
import { compose } from "@/composition";
import { type HostPort } from "@/integration/host";
import { type Advisor } from "@/modules";

class HostFixture implements HostPort {
  signal: AbortSignal | undefined;
  shutdown: (() => void) | undefined;

  register(advisor: Advisor, signal: AbortSignal, shutdown: () => void): void {
    assert.ok(advisor);
    this.signal = signal;
    this.shutdown = shutdown;
  }
}

function compositionLifecycle(): void {
  const host = new HostFixture();
  compose(host, "/nonexistent/synapse-advisor-config.json");
  assert.ok(host.signal);
  assert.ok(host.shutdown);
  assert.equal(host.signal.aborted, false);
  host.shutdown();
  assert.equal(host.signal.aborted, true);
}

test("composição registra advisor e coordena encerramento", compositionLifecycle);
