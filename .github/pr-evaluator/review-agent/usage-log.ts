import { type Usage } from "@earendil-works/pi-ai"
import { CACHE_LABEL, INPUT_LABEL, OUTPUT_LABEL, ROUND_LABEL } from "./constants"

export function logReviewUsage(round: number, usage: Usage): void {
  console.error(
    `${ROUND_LABEL}${round}${INPUT_LABEL}${usage.input}${OUTPUT_LABEL}${usage.output}${CACHE_LABEL}${usage.cacheRead}`,
  )
}
