import { Type } from "typebox"
import {
  COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
  COMPUTER_DRIVER_POLICY_MODE_PINNED,
  COMPUTER_DRIVER_POLICY_REASON_PATTERN,
  COMPUTER_DRIVER_POLICY_VERSION_PATTERN,
} from "./constants"

export const COMPUTER_DRIVER_POLICY_SCHEMA = Type.Union([
  Type.Object(
    {
      mode: Type.Literal(COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE),
    },
    { additionalProperties: false },
  ),
  Type.Object(
    {
      mode: Type.Literal(COMPUTER_DRIVER_POLICY_MODE_PINNED),
      version: Type.String({ pattern: COMPUTER_DRIVER_POLICY_VERSION_PATTERN }),
      reason: Type.String({ pattern: COMPUTER_DRIVER_POLICY_REASON_PATTERN }),
    },
    { additionalProperties: false },
  ),
])
