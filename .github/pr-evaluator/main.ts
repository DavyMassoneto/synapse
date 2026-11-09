import { readConfiguration } from "./configuration"
import { runEvaluation } from "./evaluation"

try {
  await runEvaluation(readConfiguration())
} catch (error) {
  console.error(error)
  process.exitCode = 1
}
