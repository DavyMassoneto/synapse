import { describe, test } from "vitest"
import {
  runTreeAcquisitionScenario,
  TREE_ACQUISITION_KINDS,
  TREE_ACQUISITION_MATRIX,
  TREE_ACQUISITION_PHASES,
  TREE_SUITE,
  TREE_TIMEOUT_MS,
  TREE_TRANSITION_ACTIONS,
} from "../fixtures"

function register(): void {
  for (const kind of TREE_ACQUISITION_KINDS) {
    for (const phase of TREE_ACQUISITION_PHASES) {
      for (const action of TREE_TRANSITION_ACTIONS) {
        test(
          `${TREE_ACQUISITION_MATRIX}: ${kind}/${phase}/${action}`,
          runTreeAcquisitionScenario.bind(null, kind, phase, action),
          TREE_TIMEOUT_MS,
        )
      }
    }
  }
}

describe(TREE_SUITE, register)
