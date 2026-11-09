import { type ChangedFile } from "../diff"
import { type Finding } from "../review"
import { type Partition } from "./types"

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
