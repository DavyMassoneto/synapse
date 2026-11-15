import { Type } from "typebox"
import {
  UNIX_LAUNCHER_ARM64,
  UNIX_LAUNCHER_CLOCK_PATTERN,
  UNIX_LAUNCHER_DARWIN,
  UNIX_LAUNCHER_IDENTITY,
  UNIX_LAUNCHER_LINUX,
  UNIX_LAUNCHER_X64,
} from "./constants"

export const UNIX_LAUNCHER_IDENTITY_SCHEMA = Type.Tuple([
  Type.Literal(UNIX_LAUNCHER_IDENTITY),
  Type.Union([Type.Literal(UNIX_LAUNCHER_DARWIN), Type.Literal(UNIX_LAUNCHER_LINUX)]),
  Type.Union([Type.Literal(UNIX_LAUNCHER_ARM64), Type.Literal(UNIX_LAUNCHER_X64)]),
  Type.String({ pattern: UNIX_LAUNCHER_CLOCK_PATTERN }),
])
