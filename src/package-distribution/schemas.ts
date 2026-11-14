import { Type } from "typebox"
import { MANIFEST_COMMONJS_TYPE, SOURCE_IMPORT_TARGET, SYNAPSE_IMPORT_ALIAS } from "./constants"

export const SOURCE_MANIFEST_SCHEMA = Type.Object({
  type: Type.Literal(MANIFEST_COMMONJS_TYPE),
  imports: Type.Object({ [SYNAPSE_IMPORT_ALIAS]: Type.Literal(SOURCE_IMPORT_TARGET) }),
})
