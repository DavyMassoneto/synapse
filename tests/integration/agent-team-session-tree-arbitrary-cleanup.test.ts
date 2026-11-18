import { describe, test } from "vitest"
import {
  runArbitraryTreeCleanup,
  TREE_ARBITRARY_CLEANUP,
  TREE_ARBITRARY_FAILURES,
  TREE_STRING_FAILURE,
  TREE_SUITE,
  TREE_TIMEOUT_MS,
} from "../fixtures"

function register(): void {
  for (const failure of TREE_ARBITRARY_FAILURES) {
    for (const disposalFails of [false, true]) {
      test(
        `${TREE_ARBITRARY_CLEANUP}: ${typeof failure}/${disposalFails}`,
        runArbitraryTreeCleanup.bind(null, failure, disposalFails),
        TREE_TIMEOUT_MS,
      )
    }
  }
  test(TREE_STRING_FAILURE, runArbitraryTreeCleanup.bind(null, TREE_STRING_FAILURE, false), TREE_TIMEOUT_MS)
}

describe(TREE_SUITE, register)
