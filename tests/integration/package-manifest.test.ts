import { describe, expect, test } from "vitest"
import { createDistributionManifest } from "#synapse/package-distribution"
import {
  PACKAGE_MANIFEST_PRESERVES_FIELDS,
  PACKAGE_MANIFEST_REJECTS_INVALID_JSON,
  PACKAGE_MANIFEST_REJECTS_MISSING_ALIAS,
  PACKAGE_MANIFEST_REJECTS_WRONG_TARGET,
  PACKAGE_MANIFEST_REWRITES_TARGET,
  PACKAGE_MANIFEST_SUITE,
} from "../fixtures"

function rewritesSourceTarget(): void {
  const manifest = createDistributionManifest('{"type":"commonjs","imports":{"#synapse/*":"./*/index.ts"}}')
  expect(manifest).toContain('"#synapse/*": "./*/index.js"')
}

function preservesUnrelatedFields(): void {
  const manifest = createDistributionManifest(
    '{"type":"commonjs","imports":{"#synapse/*":"./*/index.ts","#extra":"./extra.js"},"description":"./*/index.ts","metadata":{"enabled":true}}',
  )
  expect(manifest).toContain('"description": "./*/index.ts"')
  expect(manifest).toContain('"#extra": "./extra.js"')
  expect(manifest).toContain('"enabled": true')
}

function rejectsWrongTargetWithMatchingDescription(): void {
  expect(
    createDistributionManifest.bind(
      undefined,
      '{"type":"commonjs","imports":{"#synapse/*":"./bad.js"},"description":"./*/index.ts"}',
    ),
  ).toThrow()
}

function rejectsMissingAlias(): void {
  expect(createDistributionManifest.bind(undefined, '{"type":"commonjs","imports":{}}')).toThrow()
}

function rejectsInvalidJson(): void {
  expect(createDistributionManifest.bind(undefined, '{"type":')).toThrow()
}

function registerTests(): void {
  test(PACKAGE_MANIFEST_REWRITES_TARGET, rewritesSourceTarget)
  test(PACKAGE_MANIFEST_PRESERVES_FIELDS, preservesUnrelatedFields)
  test(PACKAGE_MANIFEST_REJECTS_WRONG_TARGET, rejectsWrongTargetWithMatchingDescription)
  test(PACKAGE_MANIFEST_REJECTS_MISSING_ALIAS, rejectsMissingAlias)
  test(PACKAGE_MANIFEST_REJECTS_INVALID_JSON, rejectsInvalidJson)
}

describe(PACKAGE_MANIFEST_SUITE, registerTests)
