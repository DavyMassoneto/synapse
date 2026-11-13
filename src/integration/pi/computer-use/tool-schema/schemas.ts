import { Type } from "typebox"
import {
  COMPUTER_CAPTURE,
  COMPUTER_CLICK,
  COMPUTER_DOUBLE_CLICK,
  COMPUTER_DRAG,
  COMPUTER_FOCUS_APP,
  COMPUTER_KEY,
  COMPUTER_LIST_APPS,
  COMPUTER_LIST_WINDOWS,
  COMPUTER_MIDDLE_CLICK,
  COMPUTER_RIGHT_CLICK,
  COMPUTER_SCROLL,
  COMPUTER_SET_VALUE,
  COMPUTER_TYPE,
  COMPUTER_WAIT,
} from "#synapse/modules"

export const PI_COMPUTER_COORDINATE_SCHEMA = Type.Tuple([Type.Integer(), Type.Integer()])

export const PI_COMPUTER_ACTION_SCHEMA = Type.Union([
  Type.Literal(COMPUTER_CAPTURE),
  Type.Literal(COMPUTER_CLICK),
  Type.Literal(COMPUTER_DOUBLE_CLICK),
  Type.Literal(COMPUTER_RIGHT_CLICK),
  Type.Literal(COMPUTER_MIDDLE_CLICK),
  Type.Literal(COMPUTER_DRAG),
  Type.Literal(COMPUTER_SCROLL),
  Type.Literal(COMPUTER_TYPE),
  Type.Literal(COMPUTER_KEY),
  Type.Literal(COMPUTER_SET_VALUE),
  Type.Literal(COMPUTER_WAIT),
  Type.Literal(COMPUTER_LIST_APPS),
  Type.Literal(COMPUTER_LIST_WINDOWS),
  Type.Literal(COMPUTER_FOCUS_APP),
])

export const PI_COMPUTER_PARAMETERS = Type.Object(
  {
    action: PI_COMPUTER_ACTION_SCHEMA,
    mode: Type.Optional(Type.Union([Type.Literal("som"), Type.Literal("vision"), Type.Literal("ax")])),
    app: Type.Optional(Type.String()),
    pid: Type.Optional(Type.Integer()),
    window_id: Type.Optional(Type.Integer()),
    element: Type.Optional(Type.Integer()),
    coordinate: Type.Optional(PI_COMPUTER_COORDINATE_SCHEMA),
    button: Type.Optional(Type.Union([Type.Literal("left"), Type.Literal("right"), Type.Literal("middle")])),
    modifiers: Type.Optional(
      Type.Array(
        Type.Union([
          Type.Literal("cmd"),
          Type.Literal("shift"),
          Type.Literal("option"),
          Type.Literal("alt"),
          Type.Literal("ctrl"),
          Type.Literal("fn"),
          Type.Literal("win"),
          Type.Literal("windows"),
          Type.Literal("super"),
          Type.Literal("meta"),
        ]),
      ),
    ),
    from_element: Type.Optional(Type.Integer()),
    to_element: Type.Optional(Type.Integer()),
    from_coordinate: Type.Optional(PI_COMPUTER_COORDINATE_SCHEMA),
    to_coordinate: Type.Optional(PI_COMPUTER_COORDINATE_SCHEMA),
    direction: Type.Optional(
      Type.Union([Type.Literal("up"), Type.Literal("down"), Type.Literal("left"), Type.Literal("right")]),
    ),
    amount: Type.Optional(Type.Integer()),
    value: Type.Optional(Type.String()),
    text: Type.Optional(Type.String()),
    keys: Type.Optional(Type.String()),
    seconds: Type.Optional(Type.Number()),
    raise_window: Type.Optional(Type.Boolean()),
    delivery_mode: Type.Optional(Type.Union([Type.Literal("background"), Type.Literal("foreground")])),
    bring_to_front: Type.Optional(Type.Boolean()),
    scope: Type.Optional(Type.Union([Type.Literal("window"), Type.Literal("desktop")])),
    capture_after: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
)
