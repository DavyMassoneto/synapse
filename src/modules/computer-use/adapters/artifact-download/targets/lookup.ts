import { type ComputerPlatform } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_ARTIFACT_ABSENT,
  COMPUTER_ARTIFACT_FOUND,
  COMPUTER_DRIVER_ARTIFACT_ARM64,
  COMPUTER_DRIVER_ARTIFACT_X64,
} from "../constants"
import { COMPUTER_DRIVER_ARTIFACTS } from "./constants"
import { type ComputerArtifactLookup } from "./types"

export function computerPinnedArtifact(platform: ComputerPlatform, architecture: string): ComputerArtifactLookup {
  if (architecture !== COMPUTER_DRIVER_ARTIFACT_ARM64 && architecture !== COMPUTER_DRIVER_ARTIFACT_X64) {
    return { kind: COMPUTER_ARTIFACT_ABSENT }
  }
  return { kind: COMPUTER_ARTIFACT_FOUND, artifact: COMPUTER_DRIVER_ARTIFACTS[platform][architecture] }
}
