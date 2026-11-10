import { type DiffLines } from "#evaluator/changes"
import { type Finding } from "#evaluator/review-result"
import { partitionFindings } from "./partition-findings"
import { toComment } from "./to-comment"
import { type Placement } from "./types"

export function placeFindings(lines: DiffLines, findings: Finding[]): Placement {
  const { groups, unplaced } = partitionFindings(lines, findings)
  return { comments: Array.from(groups.values(), toComment), unplaced }
}
