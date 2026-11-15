import {
  COMPUTER_DRIVER_RELEASE_TAG_PATTERN,
  COMPUTER_DRIVER_RELEASE_VERSION_ABSENT,
  COMPUTER_DRIVER_RELEASE_VERSION_FOUND,
} from "./constants"
import { type ComputerDriverReleaseVersionResult } from "./types"

export function computerReadDriverReleaseVersion(tag: string): ComputerDriverReleaseVersionResult {
  const match = COMPUTER_DRIVER_RELEASE_TAG_PATTERN.exec(tag)
  if (!match) {
    return { kind: COMPUTER_DRIVER_RELEASE_VERSION_ABSENT }
  }
  const major = match[1]
  const minor = match[2]
  const patch = match[3]
  if (!major || !minor || !patch) {
    return { kind: COMPUTER_DRIVER_RELEASE_VERSION_ABSENT }
  }
  return {
    kind: COMPUTER_DRIVER_RELEASE_VERSION_FOUND,
    version: {
      major: Number(major),
      minor: Number(minor),
      patch: Number(patch),
      text: `${major}.${minor}.${patch}`,
    },
  }
}
