import { IPHONE_PROVISION_TREE_UNCERTAIN } from "./constants"

export class IphoneProvisionInterrupted extends Error {
  constructor(reason: string, directory: string) {
    super(`${reason}. ${IPHONE_PROVISION_TREE_UNCERTAIN}: ${directory}`)
  }
}
