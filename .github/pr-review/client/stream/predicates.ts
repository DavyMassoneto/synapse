import { SSE_DATA_PREFIX } from "./constants"

export function isDataLine(line: string): boolean {
  return line.startsWith(SSE_DATA_PREFIX)
}
