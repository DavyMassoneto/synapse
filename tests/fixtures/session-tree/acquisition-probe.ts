import { readFileSync } from "node:fs"
import { join } from "node:path"
import { TREE_FILE_ENCODING, TREE_MISSING_FILE_CODE, TREE_PROBE_FILE } from "./constants"
import { type TreeAcquisitionFixtureView } from "./types"

export function readTreeProbe(fixture: TreeAcquisitionFixtureView): string {
  const path = join(fixture.directory, TREE_PROBE_FILE)
  try {
    return readFileSync(path, TREE_FILE_ENCODING)
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === TREE_MISSING_FILE_CODE) {
      return ""
    }
    throw error
  }
}
