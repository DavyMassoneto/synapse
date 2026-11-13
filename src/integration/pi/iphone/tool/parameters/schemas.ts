import { Type } from "typebox"
import {
  IPHONE_ACTION_ACTIVATE,
  IPHONE_ACTION_ALERT,
  IPHONE_ACTION_CLEAR,
  IPHONE_ACTION_CLOSE,
  IPHONE_ACTION_DOUBLE_TAP,
  IPHONE_ACTION_DRAG,
  IPHONE_ACTION_HOME,
  IPHONE_ACTION_INFO,
  IPHONE_ACTION_INSTALL,
  IPHONE_ACTION_LAUNCH,
  IPHONE_ACTION_LONG_PRESS,
  IPHONE_ACTION_ORIENTATION,
  IPHONE_ACTION_PRESS,
  IPHONE_ACTION_SCREENSHOT,
  IPHONE_ACTION_SCROLL,
  IPHONE_ACTION_SWIPE,
  IPHONE_ACTION_TAP,
  IPHONE_ACTION_TERMINATE,
  IPHONE_ACTION_TREE,
  IPHONE_ACTION_TYPE,
  IPHONE_ACTION_URL,
  IPHONE_ACTION_WAIT,
} from "#synapse/modules"
import { PI_IPHONE_VALUE_HOMESCREEN } from "../constants"

export const PI_IPHONE_PARAMETERS = Type.Object({
  action: Type.Union([
    Type.Literal(IPHONE_ACTION_TREE),
    Type.Literal(IPHONE_ACTION_SCREENSHOT),
    Type.Literal(IPHONE_ACTION_TAP),
    Type.Literal(IPHONE_ACTION_DOUBLE_TAP),
    Type.Literal(IPHONE_ACTION_LONG_PRESS),
    Type.Literal(IPHONE_ACTION_TYPE),
    Type.Literal(IPHONE_ACTION_CLEAR),
    Type.Literal(IPHONE_ACTION_SWIPE),
    Type.Literal(IPHONE_ACTION_DRAG),
    Type.Literal(PI_IPHONE_VALUE_HOMESCREEN),
    Type.Literal(IPHONE_ACTION_SCROLL),
    Type.Literal(IPHONE_ACTION_LAUNCH),
    Type.Literal(IPHONE_ACTION_TERMINATE),
    Type.Literal(IPHONE_ACTION_INSTALL),
    Type.Literal(IPHONE_ACTION_ACTIVATE),
    Type.Literal(IPHONE_ACTION_HOME),
    Type.Literal(IPHONE_ACTION_PRESS),
    Type.Literal(IPHONE_ACTION_ALERT),
    Type.Literal(IPHONE_ACTION_URL),
    Type.Literal(IPHONE_ACTION_INFO),
    Type.Literal(IPHONE_ACTION_WAIT),
    Type.Literal(IPHONE_ACTION_ORIENTATION),
    Type.Literal(IPHONE_ACTION_CLOSE),
  ]),
  element: Type.Optional(Type.Integer({ description: "Element index from the last tree" })),
  text: Type.Optional(
    Type.String({ description: "Match an element by label/name/value (exact first, then substring)" }),
  ),
  x: Type.Optional(Type.Number({ description: "X in points" })),
  y: Type.Optional(Type.Number({ description: "Y in points" })),
  text_input: Type.Optional(Type.String({ description: "Text to type" })),
  submit: Type.Optional(Type.Boolean({ description: "Press return after typing" })),
  direction: Type.Optional(Type.String({ description: "up|down|left|right" })),
  seconds: Type.Optional(Type.Number()),
  to_element: Type.Optional(Type.Integer({ description: "drag: destination element index from the last tree" })),
  to_text: Type.Optional(Type.String({ description: "drag: destination element matched by label/name/value" })),
  to_x: Type.Optional(Type.Number({ description: "drag: destination X in points" })),
  to_y: Type.Optional(Type.Number({ description: "drag: destination Y in points" })),
  edge: Type.Optional(
    Type.String({
      description:
        "drag: left|right. Hold the dragged icon at that screen edge to flip home-screen pages (use with flips)",
    }),
  ),
  flips: Type.Optional(
    Type.Integer({
      description: "drag: how many pages to flip at the edge before dropping/moving to the destination (default 0)",
    }),
  ),
  flip_wait: Type.Optional(Type.Number({ description: "drag: seconds to wait at the edge per flip (default 1.4)" })),
  move: Type.Optional(
    Type.Number({ description: "drag: seconds of the final jump to the destination (default 0.03)" }),
  ),
  op: Type.Optional(
    Type.String({
      description: "homescreen: read|edit|exit_edit|goto|folder|merge|create|extract|rename|hop|compact|audit",
    }),
  ),
  name: Type.Optional(
    Type.String({ description: "homescreen: loose app (merge/create/hop) or folder (folder/extract/rename)" }),
  ),
  name2: Type.Optional(Type.String({ description: "homescreen create: second loose app" })),
  app: Type.Optional(Type.String({ description: "homescreen extract: app to take out of folder name" })),
  into: Type.Optional(Type.String({ description: "homescreen merge: destination folder" })),
  new_name: Type.Optional(
    Type.String({ description: "homescreen create/rename: folder name (ASCII or c-cedilla only)" }),
  ),
  page: Type.Optional(
    Type.Integer({ description: "homescreen: Home Screen page (1-based) to go to first / to compact" }),
  ),
  from_page: Type.Optional(Type.Integer({ description: "homescreen merge/hop: page where the app is now" })),
  to_page: Type.Optional(Type.Integer({ description: "homescreen merge/hop: page of the destination" })),
  folder: Type.Optional(Type.Boolean({ description: "homescreen hop: the item is a folder" })),
  lift_px: Type.Optional(
    Type.Number({
      description:
        "drag: points of the slow lift right after the hold, toward the destination (default 14; 0 disables)",
    }),
  ),
  lift_ms: Type.Optional(Type.Number({ description: "drag: seconds the lift takes (default 0.25)" })),
  hover: Type.Optional(
    Type.Number({ description: "drag: seconds to hover over the destination before release (default 0.8)" }),
  ),
  bundle_id: Type.Optional(Type.String()),
  path: Type.Optional(Type.String({ description: "Path to .app/.ipa for install" })),
  url: Type.Optional(Type.String()),
  button: Type.Optional(Type.String({ description: "home|volumeup|volumedown" })),
  alert_action: Type.Optional(
    Type.Union([Type.Literal("accept"), Type.Literal("dismiss")], {
      description: "accept|dismiss; omitted means accept",
    }),
  ),
  button_label: Type.Optional(Type.String({ description: "Alert button label" })),
  orientation: Type.Optional(Type.String({ description: "portrait|landscape" })),
  max: Type.Optional(Type.Integer({ minimum: 1, description: "Max elements in tree (default 200)" })),
  tree_after: Type.Optional(Type.Boolean({ description: "Return a fresh tree after the action" })),
})
