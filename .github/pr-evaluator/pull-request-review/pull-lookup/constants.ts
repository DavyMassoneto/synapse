import { Type } from "typebox"

export const PullSchema = Type.Object({ head: Type.Object({ sha: Type.String() }) })
