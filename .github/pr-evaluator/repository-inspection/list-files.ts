import { LINE_BREAK, MAX_LISTED_FILES, MORE_FILES, NO_FILES } from "./constants"
import { type RepositorySnapshot } from "./types"

export function listFiles(snapshot: RepositorySnapshot, prefix: string): string {
  const listed: string[] = []
  for (const path of snapshot.files) {
    if (path.startsWith(prefix)) {
      if (listed.length === MAX_LISTED_FILES) {
        return [...listed, MORE_FILES].join(LINE_BREAK)
      }
      listed.push(path)
    }
  }
  if (listed.length === 0) {
    return `${NO_FILES}${prefix}`
  }
  return listed.join(LINE_BREAK)
}
