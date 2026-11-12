import { PI_REQUEST_LOG_MISSING_REQUEST } from "./constants"
import { type PiProcessRequestLog } from "./types"

export function requirePiProcessRequest(requests: PiProcessRequestLog[], index: number): PiProcessRequestLog {
  const request = requests[index]
  if (request) {
    return request
  }
  throw new Error(PI_REQUEST_LOG_MISSING_REQUEST)
}
