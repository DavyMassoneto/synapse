import { type Static } from "typebox"
import { type InspectionSchema, type PageSchema } from "./constants"

export type InspectionRequest = Static<typeof InspectionSchema>
export type PageRequest = Static<typeof PageSchema>
export interface InspectionContext {
  sha: string
  diff: string
}
