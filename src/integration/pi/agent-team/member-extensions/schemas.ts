import { Type } from "typebox"

export const TEAM_MEMBER_EXTENSIONS_SCHEMA = Type.Object({
  memberExtensions: Type.Array(Type.String({ minLength: 1 })),
})
