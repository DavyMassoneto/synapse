import { collectLineNumbers } from "./lines"
import { findPath } from "./paths"
import { splitSections } from "./sections"
import { type ChangedFile, type OptionalChangedFile } from "./types"

export function parseFile(section: string): OptionalChangedFile {
  const path = findPath(section)
  if (path === undefined) {
    return undefined
  }
  const lines = collectLineNumbers(section)
  return { path, addedLines: lines.added, commentableLines: lines.commentable }
}

export function parseDiff(diff: string): ChangedFile[] {
  const files: ChangedFile[] = []
  for (const section of splitSections(diff)) {
    const file = parseFile(section)
    if (file !== undefined) {
      files.push(file)
    }
  }
  return files
}
