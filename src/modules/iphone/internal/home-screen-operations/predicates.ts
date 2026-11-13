import { type IphoneHomeIcon } from "#synapse/modules/iphone/public/contracts"

export function hasIphoneSameFolderContents(actual: string[], expected: string[]): boolean {
  if (actual.length !== expected.length) {
    return false
  }
  const left = actual.toSorted()
  const right = expected.toSorted()
  return left.every((name, index) => name === right[index])
}

export function isIphoneCompactMoveValid(
  before: IphoneHomeIcon[],
  after: IphoneHomeIcon[],
  moved: IphoneHomeIcon,
  slot: number,
): boolean {
  if (before.length !== after.length) {
    return false
  }
  for (const icon of before) {
    const matches = after.filter((candidate) => candidate.name === icon.name && candidate.folder === icon.folder)
    if (matches.length !== 1 || matches[0]?.slot !== (icon === moved ? slot : icon.slot)) {
      return false
    }
  }
  return true
}
