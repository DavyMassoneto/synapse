import { type PiProcessMatch, type PiProcessRecord } from "./types"

export function isPiProcessRecordMatch(record: PiProcessRecord, match: PiProcessMatch): boolean {
  return (
    record.type === match.type &&
    (!match.id || record.id === match.id) &&
    (!match.method || ("method" in record && record.method === match.method)) &&
    (!match.statusKey || ("statusKey" in record && record.statusKey === match.statusKey))
  )
}
