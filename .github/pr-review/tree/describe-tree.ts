import { isIgnored } from "../scope"
import { LINE_BREAK } from "../separators"
import { type CommandRunner, runGit } from "../shell"
import { tryReadTextLines } from "../source"
import { fillTemplate } from "../templates"
import {
  COUNT_WIDTH,
  LIST_FILES_ARGUMENTS,
  MAX_TREE_LINES,
  TREE_LINE,
  TREE_OMITTED,
  TREE_UNREADABLE,
} from "./constants"

export function describeTree(runner: CommandRunner): string {
  const paths = listTreePaths(runner)
  const lines = paths
    .slice(0, MAX_TREE_LINES)
    .map((path) => fillTemplate(TREE_LINE, [describeLineCount(path).padStart(COUNT_WIDTH), path]))
  if (countOmitted(paths) > 0) {
    lines.push(fillTemplate(TREE_OMITTED, [String(countOmitted(paths))]))
  }
  return lines.join(LINE_BREAK)
}

export function describeLineCount(path: string): string {
  const lines = tryReadTextLines(path)
  if (lines === undefined) {
    return TREE_UNREADABLE
  }
  return String(lines.length)
}

export function countOmitted(paths: string[]): number {
  return Math.max(0, paths.length - MAX_TREE_LINES)
}

export function listTreePaths(runner: CommandRunner): string[] {
  return runGit(runner, LIST_FILES_ARGUMENTS)
    .split(LINE_BREAK)
    .filter((path) => path.length > 0 && !isIgnored(path))
}
