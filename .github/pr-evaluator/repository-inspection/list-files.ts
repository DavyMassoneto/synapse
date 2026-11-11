import { MAX_LISTED_FILES, MORE_FILES, NO_FILES } from "./constants"
import { renderInspectionItems } from "./render-items"
import { type RepositorySnapshot } from "./types"

function* matchingFiles(snapshot: RepositorySnapshot, prefix: string): Generator<string> {
  for (const path of snapshot.files) {
    if (path.startsWith(prefix)) {
      yield path
    }
  }
}

export function listFiles(snapshot: RepositorySnapshot, prefix: string): string {
  return renderInspectionItems(matchingFiles(snapshot, prefix), {
    maximum: MAX_LISTED_FILES,
    more: MORE_FILES,
    empty: `${NO_FILES}${prefix}`,
  })
}
