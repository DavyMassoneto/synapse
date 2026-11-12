import { type ModelRoute } from "@earendil-works/pi-coding-agent"
import { PI_ROUTER_STATUS, PI_ROUTER_STATUS_ARROW, PI_ROUTER_STATUS_LEVEL_SEPARATOR } from "./constants"
import { type PiRouterContext, type PiRouterState } from "./types"

export function showRouterStatus(result: ModelRoute<PiRouterState>, context: PiRouterContext): void {
  if (context.hasUI && result.state) {
    context.ui.setStatus(
      PI_ROUTER_STATUS,
      `${result.state.reason}${PI_ROUTER_STATUS_ARROW}${result.model.id}${PI_ROUTER_STATUS_LEVEL_SEPARATOR}${result.thinkingLevel}`,
    )
  }
}
