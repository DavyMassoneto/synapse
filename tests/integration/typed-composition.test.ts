import assert from "node:assert/strict";
import { test } from "vitest";
import { type AdvisorLifecycle, type AdvisorRegistrationPort, compose } from "@/composition";
import { type Advisor } from "@/modules";

class HostFixture implements AdvisorRegistrationPort {
  signal: AbortSignal | undefined;
  shutdown: (() => void) | undefined;

  register(advisor: Advisor, lifecycle: AdvisorLifecycle): void {
    assert.ok(advisor);
    this.signal = lifecycle.signal;
    this.shutdown = lifecycle.shutdown;
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
