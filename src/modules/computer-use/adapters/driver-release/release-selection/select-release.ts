import { COMPUTER_DRIVER_POLICY_MODE_PINNED } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_DRIVER_RELEASE_FAILED } from "../constants"
import { type ComputerDriverReleaseRecord } from "../types"
import {
  COMPUTER_DRIVER_RELEASE_NOT_FOUND,
  COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND,
  COMPUTER_DRIVER_RELEASE_SELECTED,
  COMPUTER_DRIVER_RELEASE_VERSION_ABSENT,
} from "./constants"
import { computerReadDriverReleaseVersion } from "./read-release-version"
import {
  type ComputerDriverReleaseCandidate,
  type ComputerDriverReleaseSelectionRequest,
  type ComputerDriverReleaseSelectionResult,
  type ComputerDriverReleaseVersion,
} from "./types"

export function computerSelectDriverRelease(
  request: ComputerDriverReleaseSelectionRequest,
): ComputerDriverReleaseSelectionResult {
  const candidates = computerDriverReleaseCandidates(request.releases)
  if (request.policy.mode === COMPUTER_DRIVER_POLICY_MODE_PINNED) {
    const pinnedVersion = request.policy.version
    const pinned = candidates.find((candidate) => candidate.version.text === pinnedVersion)
    if (!pinned) {
      return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND }
    }
    return { kind: COMPUTER_DRIVER_RELEASE_SELECTED, release: pinned.release, version: pinned.version.text }
  }
  const [latest] = candidates.sort((first, second) =>
    computerCompareDriverReleaseVersions(second.version, first.version),
  )
  if (!latest) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_NOT_FOUND }
  }
  return { kind: COMPUTER_DRIVER_RELEASE_SELECTED, release: latest.release, version: latest.version.text }
}

function computerDriverReleaseCandidates(releases: ComputerDriverReleaseRecord[]): ComputerDriverReleaseCandidate[] {
  const candidates: ComputerDriverReleaseCandidate[] = []
  for (const release of releases) {
    if (release.draft) {
      continue
    }
    const version = computerReadDriverReleaseVersion(release.tag_name)
    if (version.kind === COMPUTER_DRIVER_RELEASE_VERSION_ABSENT) {
      continue
    }
    candidates.push({ release, version: version.version })
  }
  return candidates
}

function computerCompareDriverReleaseVersions(
  first: ComputerDriverReleaseVersion,
  second: ComputerDriverReleaseVersion,
): number {
  const major = first.major - second.major
  if (major !== 0) {
    return major
  }
  const minor = first.minor - second.minor
  if (minor !== 0) {
    return minor
  }
  return first.patch - second.patch
}
