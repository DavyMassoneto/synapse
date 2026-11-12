import { DIFF_DESCRIPTION, PageSchema, READ_DIFF } from "#evaluator/output-page"
import { INSPECT_REPOSITORY, INSPECTION_DESCRIPTION, InspectionSchema } from "#evaluator/repository-inspection"
import { ReviewSubmissionSchema, SUBMISSION_DESCRIPTION, SUBMIT_REVIEW } from "#evaluator/review-result"
import { SEQUENTIAL } from "./constants"
import { type ReviewToolExecutors, type ReviewTools } from "./types"

export function reviewTools(executors: ReviewToolExecutors): ReviewTools {
  return [
    {
      name: INSPECT_REPOSITORY,
      label: INSPECT_REPOSITORY,
      description: INSPECTION_DESCRIPTION,
      parameters: InspectionSchema,
      execute: executors.inspect,
    },
    {
      name: READ_DIFF,
      label: READ_DIFF,
      description: DIFF_DESCRIPTION,
      parameters: PageSchema,
      execute: executors.diff,
    },
    {
      name: SUBMIT_REVIEW,
      label: SUBMIT_REVIEW,
      description: SUBMISSION_DESCRIPTION,
      parameters: ReviewSubmissionSchema,
      executionMode: SEQUENTIAL,
      execute: executors.submit,
    },
  ]
}
