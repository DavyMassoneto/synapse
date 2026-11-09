import { createExecution, executeReview } from "./pipeline"

process.exit(await executeReview(createExecution()))
