import { type ChangedFile } from "#synapse/diff"
import { type Finding } from "#synapse/review"
import { LOCATION_SEPARATOR } from "./constants"
import { type LineGroup, type Partition } from "./types"

export function partitionFindings(findings: Finding[], files: ChangedFile[]): Partition {
  const commentable = new Map<string, Set<number>>(files.map((file) => [file.path, file.commentableLines]))
  const partition: Partition = { anchored: [], outsideDiff: [], general: [] }
  for (const finding of findings) {
    if (finding.line === 0) {
      partition.general.push(finding)
    } else if (commentable.get(finding.path)?.has(finding.line)) {
      partition.anchored.push(finding)
    } else {
      partition.outsideDiff.push(finding)
    }
  }
  return partition
}

export function groupByLine(findings: Finding[]): LineGroup[] {
  const groups = new Map<string, LineGroup>()
  for (const finding of findings) {
    const key = [finding.path, String(finding.line)].join(LOCATION_SEPARATOR)
    const group = groups.get(key)
    if (group === undefined) {
      groups.set(key, { path: finding.path, line: finding.line, findings: [finding] })
    } else {
      group.findings.push(finding)
    }
  }
  return [...groups.values()]
}
