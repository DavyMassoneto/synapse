import { registerModelRouter } from "#synapse/integration"
import { createModelRouter } from "#synapse/modules"
import { fixtureModel, TestUI } from "../context"
import {
  ROUTER_TEST_CONTEXT_WINDOW,
  ROUTER_TEST_HIGH,
  ROUTER_TEST_INVESTIGATION,
  ROUTER_TEST_USER,
  ROUTER_TEST_VIRTUAL_ID,
  ROUTER_TEST_VIRTUAL_PROVIDER,
} from "./constants"
import { RouterFixtureHost } from "./host"
import { RouterFixtureRegistry } from "./registry"
import { type RouterIntegrationSut } from "./types"

export function makeRouterIntegrationSut(): RouterIntegrationSut {
  const host = new RouterFixtureHost()
  registerModelRouter(host, createModelRouter)
  return {
    host,
    context: { modelRegistry: new RouterFixtureRegistry(), hasUI: false, ui: new TestUI() },
    request: {
      model: fixtureModel(ROUTER_TEST_VIRTUAL_PROVIDER, ROUTER_TEST_VIRTUAL_ID, ROUTER_TEST_CONTEXT_WINDOW),
      thinkingLevel: ROUTER_TEST_HIGH,
      reason: ROUTER_TEST_USER,
      messages: [{ role: ROUTER_TEST_USER, content: ROUTER_TEST_INVESTIGATION, timestamp: 0 }],
    },
  }
}
