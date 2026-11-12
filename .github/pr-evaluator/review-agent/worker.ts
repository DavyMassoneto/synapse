import { Value } from "typebox/value"
import { InspectionFailure } from "#evaluator/repository-inspection"
import { EMPTY_TEXT, FAILURE_EXIT_CODE, INPUT_ENCODING, WORKER_FAILURE, WorkerInputSchema } from "./constants"
import { ReviewFailure } from "./review-failure"
import { ReviewRun } from "./review-run"

async function work(): Promise<void> {
  process.stdin.setEncoding(INPUT_ENCODING)
  let text = EMPTY_TEXT
  for await (const chunk of process.stdin) {
    text += chunk
  }
  const input = Value.Parse(WorkerInputSchema, JSON.parse(text))
  const review = await new ReviewRun(input).run()
  process.stdout.write(JSON.stringify({ summary: review.summary, findings: review.findings }))
}

try {
  await work()
} catch (error) {
  if (error instanceof ReviewFailure || error instanceof InspectionFailure) {
    console.error(JSON.stringify(error.message))
  } else {
    console.error(WORKER_FAILURE)
  }
  process.exitCode = FAILURE_EXIT_CODE
}
