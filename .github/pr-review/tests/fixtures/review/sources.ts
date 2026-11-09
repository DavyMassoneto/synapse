import { type ReviewInput } from "#synapse/review"
import { type Source } from "#synapse/source"

export const SOURCE_A: Source = { path: "a.ts", text: "=== a.ts", incomplete: false }
export const REVIEW_INPUT: ReviewInput = { treeListing: "arvore", deletedPaths: [] }
