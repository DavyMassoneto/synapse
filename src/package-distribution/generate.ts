import { readFileSync, rmSync, writeFileSync } from "node:fs"
import { DISTRIBUTION_MANIFEST_PATH, MANIFEST_ENCODING, SOURCE_MANIFEST_PATH } from "./constants"
import { createDistributionManifest } from "./manifest"

function generateDistributionManifest(): void {
  rmSync(DISTRIBUTION_MANIFEST_PATH, { force: true })
  const source = readFileSync(SOURCE_MANIFEST_PATH, MANIFEST_ENCODING)
  writeFileSync(DISTRIBUTION_MANIFEST_PATH, createDistributionManifest(source))
}

generateDistributionManifest()
