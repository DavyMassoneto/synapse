import { expect, test } from "vitest";
import { compose } from "#synapse/composition";

function compositionLifecycle(): void {
  const composition = compose("/nonexistent/synapse-advisor-config.json");
  expect(composition.advisor).toBeDefined();
  expect(composition.signal.aborted).toBe(false);
  composition.shutdown();
  expect(composition.signal.aborted).toBe(true);
}

test("composição cria advisor e coordena encerramento", compositionLifecycle);
