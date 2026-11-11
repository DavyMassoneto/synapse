import { runGit } from "#evaluator/git-output"
import { GIT_LIST_ARGUMENTS, LISTING_SUBJECT, PATH_TERMINATOR } from "./constants"
import { type RepositorySnapshot, type SnapshotFiles } from "./types"

export function openSnapshot(sha: string): RepositorySnapshot {
  const files: SnapshotFiles = new Set()
  for (const path of runGit([...GIT_LIST_ARGUMENTS, sha], LISTING_SUBJECT).split(PATH_TERMINATOR)) {
    if (path) {
      files.add(path)
    }
  }
  return { sha, files }
}
