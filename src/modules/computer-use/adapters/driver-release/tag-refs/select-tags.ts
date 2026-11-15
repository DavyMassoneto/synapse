import { COMPUTER_DRIVER_POLICY_MODE_PINNED } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_DRIVER_RELEASE_FAILED,
  COMPUTER_DRIVER_RELEASE_TAG_REF_PREFIX,
  COMPUTER_DRIVER_RELEASE_TAGS_SELECTED,
} from "../constants"
import {
  COMPUTER_DRIVER_RELEASE_NOT_FOUND,
  COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND,
  COMPUTER_DRIVER_RELEASE_VERSION_ABSENT,
  type ComputerDriverReleaseVersion,
  computerReadDriverReleaseVersion,
} from "../release-selection"
import {
  type ComputerDriverReleaseTagCandidate,
  type ComputerDriverReleaseTagSelectionRequest,
  type ComputerDriverReleaseTagsResult,
} from "./types"

export function computerSelectDriverReleaseTags(
  request: ComputerDriverReleaseTagSelectionRequest,
): ComputerDriverReleaseTagsResult {
  const candidates = computerDriverReleaseTagCandidates(request.refs)
  if (request.policy.mode === COMPUTER_DRIVER_POLICY_MODE_PINNED) {
    const pinnedVersion = request.policy.version
    const pinned = candidates.find((candidate) => candidate.version.text === pinnedVersion)
    if (!pinned) {
      return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND }
    }
    return {
      kind: COMPUTER_DRIVER_RELEASE_TAGS_SELECTED,
      version: pinned.version.text,
      tags: [pinned.tag],
    }
  }
  candidates.sort((first, second) => computerCompareDriverReleaseVersions(second.version, first.version))
  const [latest] = candidates
  if (!latest) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_NOT_FOUND }
  }
  return {
    kind: COMPUTER_DRIVER_RELEASE_TAGS_SELECTED,
    version: latest.version.text,
    tags: candidates.map((candidate) => candidate.tag),
  }
}

function computerDriverReleaseTagCandidates(refs: string[]): ComputerDriverReleaseTagCandidate[] {
  const candidates: ComputerDriverReleaseTagCandidate[] = []
  for (const ref of refs) {
    if (!ref.startsWith(COMPUTER_DRIVER_RELEASE_TAG_REF_PREFIX)) {
      continue
    }
    const tag = ref.slice(COMPUTER_DRIVER_RELEASE_TAG_REF_PREFIX.length)
    const version = computerReadDriverReleaseVersion(tag)
    if (version.kind === COMPUTER_DRIVER_RELEASE_VERSION_ABSENT) {
      continue
    }
    candidates.push({ tag, version: version.version })
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
