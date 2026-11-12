import { type Static } from "typebox"
import { type PageSchema } from "./constants"

export type PageRequest = Static<typeof PageSchema>
export interface RenderedPage {
  text: string
  startLine: number
  endLine: number
}
