import { type Static } from "typebox"
import { type FindingSchema, type ReviewResultSchema } from "./constants"

export type Finding = Static<typeof FindingSchema>

export type ReviewResult = Static<typeof ReviewResultSchema>
