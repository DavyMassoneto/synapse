import { ROUTER_ABORT_NAME, ROUTER_CANCELLED } from "./constants"

export function checkRouterAbort(signal?: AbortSignal): void {
  if (signal?.aborted) {
    rejectRouterCancellation()
  }
}

export function rejectRouterCancellation(): never {
  throw new DOMException(ROUTER_CANCELLED, ROUTER_ABORT_NAME)
}
