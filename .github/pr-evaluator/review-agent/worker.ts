import { Value } from "typebox/value"
import { EMPTY_TEXT, FAILURE_EXIT_CODE, INPUT_ENCODING, WORKER_FAILURE, WorkerInputSchema } from "./constants"
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
} catch {
  console.error(WORKER_FAILURE)
  process.exitCode = FAILURE_EXIT_CODE
}
