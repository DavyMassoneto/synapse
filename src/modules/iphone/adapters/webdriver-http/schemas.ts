import { Type } from "typebox"
import { IPHONE_HTTP_ELEMENT_ID } from "./constants"

export const IPHONE_HTTP_ERROR_VALUE_SCHEMA = Type.Object({ error: Type.String(), message: Type.String() })

export const IPHONE_HTTP_SESSION_SCHEMA = Type.Object({
  value: Type.Union([
    Type.Object({ sessionId: Type.String({ minLength: 1 }) }, { not: { required: ["error", "message"] } }),
    IPHONE_HTTP_ERROR_VALUE_SCHEMA,
  ]),
})

export const IPHONE_HTTP_STRING_SCHEMA = Type.Object({
  value: Type.Union([Type.String(), IPHONE_HTTP_ERROR_VALUE_SCHEMA]),
})

export const IPHONE_HTTP_ELEMENT_SCHEMA = Type.Object({
  value: Type.Union([
    Type.Object(
      { [IPHONE_HTTP_ELEMENT_ID]: Type.String({ minLength: 1 }) },
      { not: { required: ["error", "message"] } },
    ),
    IPHONE_HTTP_ERROR_VALUE_SCHEMA,
  ]),
})

export const IPHONE_HTTP_RECT_SCHEMA = Type.Object({
  value: Type.Union([
    Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
        width: Type.Number(),
        height: Type.Number(),
      },
      { not: { required: ["error", "message"] } },
    ),
    IPHONE_HTTP_ERROR_VALUE_SCHEMA,
  ]),
})

export const IPHONE_HTTP_MOBILE_TERMINATE_SCHEMA = Type.Object({
  value: Type.Union([Type.Boolean(), IPHONE_HTTP_ERROR_VALUE_SCHEMA]),
})

export const IPHONE_HTTP_MOBILE_LAUNCH_SCHEMA = Type.Object({
  value: Type.Union([
    Type.Union([Type.Null(), Type.Object({ pid: Type.Number() }, { not: { required: ["error", "message"] } })]),
    IPHONE_HTTP_ERROR_VALUE_SCHEMA,
  ]),
})

export const IPHONE_HTTP_MOBILE_RESULT_SCHEMA = Type.Object({
  value: Type.Union([Type.Null(), IPHONE_HTTP_ERROR_VALUE_SCHEMA]),
})

export const IPHONE_HTTP_INFO_SCHEMA = Type.Object({
  value: Type.Union([
    Type.Object(
      {
        name: Type.Optional(Type.String()),
        bundleId: Type.Optional(Type.String()),
        model: Type.Optional(Type.String()),
        osVersion: Type.Optional(Type.String()),
      },
      { not: { required: ["error", "message"] } },
    ),
    IPHONE_HTTP_ERROR_VALUE_SCHEMA,
  ]),
})

export const IPHONE_HTTP_EMPTY_SCHEMA = Type.Object({
  value: Type.Union([Type.Null(), IPHONE_HTTP_ERROR_VALUE_SCHEMA]),
})
