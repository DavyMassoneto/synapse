import { readConfiguration } from "./configuration"
import { runEvaluation } from "./evaluation"

await runEvaluation(readConfiguration())
