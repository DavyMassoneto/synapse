import { Type } from "typebox";
import type { ThinkingLevel } from "../public/contracts";

export function thinkingLiteral(level: ThinkingLevel) {
  return Type.Literal(level);
}
