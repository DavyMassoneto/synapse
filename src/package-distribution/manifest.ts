import { Value } from "typebox/value"
import { DISTRIBUTION_IMPORT_TARGET, MANIFEST_INDENT_SPACES, MANIFEST_NEWLINE, SYNAPSE_IMPORT_ALIAS } from "./constants"
import { SOURCE_MANIFEST_SCHEMA } from "./schemas"

export function createDistributionManifest(content: string): string {
  const source = Value.Parse(SOURCE_MANIFEST_SCHEMA, JSON.parse(content))
  const distribution = {
    ...source,
    imports: { ...source.imports, [SYNAPSE_IMPORT_ALIAS]: DISTRIBUTION_IMPORT_TARGET },
  }
  return `${JSON.stringify(distribution, undefined, MANIFEST_INDENT_SPACES)}${MANIFEST_NEWLINE}`
}
