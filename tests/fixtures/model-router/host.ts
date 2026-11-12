import { type ModelRouterHost, type PiRouterVirtualModel } from "#synapse/integration"
import { ROUTER_FIXTURE_HOST_MISSING } from "./constants"

export class RouterFixtureHost implements ModelRouterHost {
  private model?: PiRouterVirtualModel

  registerVirtualModel(model: PiRouterVirtualModel): void {
    this.model = model
  }

  requireModel(): PiRouterVirtualModel {
    if (!this.model) {
      throw new Error(ROUTER_FIXTURE_HOST_MISSING)
    }
    return this.model
  }
}
