import { type IphoneElement } from "#synapse/modules/iphone/public/contracts"
import { IPHONE_TREE_FOUND, IPHONE_TREE_MISSING } from "./constants"
import { type IphoneTreeSearch } from "./types"

export function findIphoneElement(elements: IphoneElement[], text: string): IphoneTreeSearch {
  if (!text) {
    return { kind: IPHONE_TREE_MISSING }
  }
  const query = text.toLowerCase()
  const exact = elements.find((element) =>
    [element.label, element.name, element.value].some((value) => value.toLowerCase() === query),
  )
  if (exact) {
    return { kind: IPHONE_TREE_FOUND, element: exact }
  }
  const partial = elements.find((element) =>
    [element.label, element.name, element.value].some((value) => value.toLowerCase().includes(query)),
  )
  if (partial) {
    return { kind: IPHONE_TREE_FOUND, element: partial }
  }
  return { kind: IPHONE_TREE_MISSING }
}
