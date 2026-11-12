import { type Api, type Model } from "@earendil-works/pi-ai"
import { type MemberModelRegistryContext } from "#synapse/integration"
import { type ToolsModelRegistryPort } from "./types"

export class ToolsModelRegistry implements ToolsModelRegistryPort {
  constructor(privateModel: Model<Api>) {
    this.model = privateModel
  }

  private readonly model: Model<Api>

  authorized = true

  getAvailable(): Model<Api>[] {
    return [this.model]
  }

  find(provider: string, id: string): ReturnType<MemberModelRegistryContext["modelRegistry"]["find"]> {
    return this.getAvailable().find((model) => model.provider === provider && model.id === id)
  }

  hasConfiguredAuth(): boolean {
    return this.authorized
  }
}
