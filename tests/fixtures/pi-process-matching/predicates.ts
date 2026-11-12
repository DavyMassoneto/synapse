import { type PiProcessMatch } from "./types"

export function isPiProcessRecordMatch(record: PiProcessMatch, match: PiProcessMatch): boolean {
  return (
    record.type === match.type &&
    (!match.id || record.id === match.id) &&
    (!match.method || record.method === match.method) &&
    (!match.statusKey || record.statusKey === match.statusKey)
  )
}
