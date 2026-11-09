import { TIMESTAMP_SEPARATOR } from "./constants"

export function stripTimestamp(path: string): string {
  return path.split(TIMESTAMP_SEPARATOR).slice(0, 1).join(TIMESTAMP_SEPARATOR)
}
