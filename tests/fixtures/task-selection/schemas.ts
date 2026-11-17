import { Type } from "typebox"

export const SELECTION_REQUESTS_SCHEMA = Type.Object({
  messages: Type.Array(
    Type.Object({
      role: Type.String(),
      sections: Type.Optional(
        Type.Object({
          agent_team_execution: Type.Optional(Type.String()),
          selection_external: Type.Optional(Type.Union([Type.String(), Type.Null()])),
        }),
      ),
    }),
  ),
})
