import { readConfiguration } from "./configuration"
import { FAILURE_EXIT_CODE } from "./constants"
import { runEvaluation } from "./evaluation"

try {
  await runEvaluation(readConfiguration())
} catch (error) {
  console.error(error)
  process.exitCode = FAILURE_EXIT_CODE
}
