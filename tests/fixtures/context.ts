import type { AdvisorContext } from "#synapse/integration";
import type { ScopedModels } from "./test-context-types";
import { TestRegistry } from "./test-registry";
import { TestSession } from "./test-session";
import { TestUI } from "./test-ui";

export class TestContext implements AdvisorContext {
  hasUI = false;
  scopedModels: ScopedModels = [];
  readonly modelRegistry = new TestRegistry();
  readonly sessionManager = new TestSession();
  readonly ui = new TestUI();
  getSystemPrompt(): string {
    return "system";
  }
}
