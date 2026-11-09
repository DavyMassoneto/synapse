import { runEvaluation } from "./pipeline"
import { readSettings } from "./settings"

try {
  await runEvaluation(readSettings())
} catch (error) {
  console.error(error)
  process.exitCode = 1
}
