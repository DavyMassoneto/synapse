import { LINE_BREAK } from "../separators"
import { type CommandRunner } from "../shell"
import { fillTemplate } from "../templates"
import { COUNT_WIDTH, MAX_TREE_LINES, TREE_LINE, TREE_OMITTED } from "./constants"
import { countLines } from "./count-lines"
import { countOmitted } from "./count-omitted"
import { listTreePaths } from "./list-tree-paths"

export function describeTree(runner: CommandRunner): string {
  const paths = listTreePaths(runner)
  const lines = paths
    .slice(0, MAX_TREE_LINES)
    .map((path) => fillTemplate(TREE_LINE, [String(countLines(path)).padStart(COUNT_WIDTH), path]))
  if (countOmitted(paths) > 0) {
    lines.push(fillTemplate(TREE_OMITTED, [String(countOmitted(paths))]))
  }
  return lines.join(LINE_BREAK)
}
