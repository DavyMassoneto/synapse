import { COMPUTER_DRIVER_RELEASE_FAILED } from "../constants"
import {
  COMPUTER_DRIVER_RELEASE_ARCHITECTURE_ARM64,
  COMPUTER_DRIVER_RELEASE_ARCHITECTURE_UNSUPPORTED,
  COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
  COMPUTER_DRIVER_RELEASE_ASSET_MISSING,
  COMPUTER_DRIVER_RELEASE_ASSET_PREFIX,
  COMPUTER_DRIVER_RELEASE_ASSET_SELECTED,
  COMPUTER_DRIVER_RELEASE_ASSET_SUFFIXES,
} from "./constants"
import { type ComputerDriverReleaseAssetRequest, type ComputerDriverReleaseAssetResult } from "./types"

export function computerSelectDriverReleaseAsset(
  request: ComputerDriverReleaseAssetRequest,
): ComputerDriverReleaseAssetResult {
  if (
    request.architecture !== COMPUTER_DRIVER_RELEASE_ARCHITECTURE_ARM64 &&
    request.architecture !== COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64
  ) {
    return {
      kind: COMPUTER_DRIVER_RELEASE_FAILED,
      message: `${COMPUTER_DRIVER_RELEASE_ARCHITECTURE_UNSUPPORTED} ${request.architecture}.`,
    }
  }
  const suffix = COMPUTER_DRIVER_RELEASE_ASSET_SUFFIXES[request.platform][request.architecture]
  const assetName = `${COMPUTER_DRIVER_RELEASE_ASSET_PREFIX}${request.version}-${suffix}`
  const asset = request.assets.find((entry) => entry.name === assetName)
  if (!asset) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: `${COMPUTER_DRIVER_RELEASE_ASSET_MISSING} ${assetName}.` }
  }
  return { kind: COMPUTER_DRIVER_RELEASE_ASSET_SELECTED, asset }
}
