import { Type } from "typebox"
import { IPHONE_HTTP_ELEMENT_ID } from "./constants"

export const IPHONE_HTTP_SUCCESS_SCHEMA = Type.Object({
  value: Type.Union([Type.Null(), Type.Boolean(), Type.Number(), Type.String(), Type.Object({})]),
})

export const IPHONE_HTTP_ERROR_SCHEMA = Type.Object({
  value: Type.Object({ error: Type.String(), message: Type.String() }),
})

export const IPHONE_HTTP_RESPONSE_SCHEMA = Type.Union([IPHONE_HTTP_ERROR_SCHEMA, IPHONE_HTTP_SUCCESS_SCHEMA])

export const IPHONE_HTTP_SESSION_SCHEMA = Type.Object({
  value: Type.Object({ sessionId: Type.String({ minLength: 1 }) }),
})

export const IPHONE_HTTP_STRING_SCHEMA = Type.Object({ value: Type.String() })

export const IPHONE_HTTP_ELEMENT_SCHEMA = Type.Object({
  value: Type.Object({ [IPHONE_HTTP_ELEMENT_ID]: Type.String({ minLength: 1 }) }),
})

export const IPHONE_HTTP_RECT_SCHEMA = Type.Object({
  value: Type.Object({ x: Type.Number(), y: Type.Number(), width: Type.Number(), height: Type.Number() }),
})

export const IPHONE_HTTP_MOBILE_TERMINATE_SCHEMA = Type.Object({ value: Type.Boolean() })

export const IPHONE_HTTP_MOBILE_LAUNCH_SCHEMA = Type.Object({
  value: Type.Union([Type.Null(), Type.Object({ pid: Type.Number() })]),
})

export const IPHONE_HTTP_MOBILE_RESULT_SCHEMA = Type.Object({ value: Type.Null() })

export const IPHONE_HTTP_INFO_SCHEMA = Type.Object({
  value: Type.Object({
    name: Type.Optional(Type.String()),
    bundleId: Type.Optional(Type.String()),
    model: Type.Optional(Type.String()),
    osVersion: Type.Optional(Type.String()),
  }),
})

export const IPHONE_HTTP_EMPTY_SCHEMA = Type.Object({ value: Type.Null() })
