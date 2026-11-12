import { parseIphoneElementTree } from "#synapse/modules/iphone/internal/element-tree"
import {
  type IphoneHomeScreenPort,
  type IphoneHomeSwipeDirection,
} from "#synapse/modules/iphone/internal/home-screen-operations"
import { buildIphonePress, type IphonePointerAction } from "#synapse/modules/iphone/internal/pointer-gestures"
import {
  IPHONE_REFUSED,
  type IphoneElement,
  type IphoneManagedPort,
  type IphonePoint,
  type IphoneRectangle,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HTTP_HOME_DRAG,
  IPHONE_HTTP_HOME_KEYS,
  IPHONE_HTTP_HOME_LEFT,
  IPHONE_HTTP_HOME_MAX_ELEMENTS,
  IPHONE_HTTP_HOME_SWIPE_RATIO,
  IPHONE_HTTP_HOME_SWIPE_SECONDS,
  IPHONE_HTTP_HOME_TAP_MS,
} from "./constants"

export class IphoneHttpHomePort implements IphoneHomeScreenPort {
  private readonly session: IphoneManagedPort

  constructor(session: IphoneManagedPort) {
    this.session = session
  }

  async viewport(signal: AbortSignal): Promise<IphoneRectangle> {
    return this.session.rect(signal)
  }

  async elements(signal: AbortSignal): Promise<IphoneElement[]> {
    const tree = parseIphoneElementTree(await this.session.source(signal), IPHONE_HTTP_HOME_MAX_ELEMENTS)
    if (tree.kind === IPHONE_REFUSED) {
      throw new Error(tree.message)
    }
    return tree.tree.elements
  }

  async actions(actions: IphonePointerAction[], signal: AbortSignal): Promise<void> {
    await this.session.actions(actions, signal)
  }

  async tap(point: IphonePoint, signal: AbortSignal): Promise<void> {
    const gesture = buildIphonePress(point, IPHONE_HTTP_HOME_TAP_MS)
    if (gesture.kind === IPHONE_REFUSED) {
      throw new Error(gesture.message)
    }
    await this.session.actions(gesture.actions, signal)
  }

  async type(text: string, signal: AbortSignal): Promise<void> {
    await this.session.mobile(IPHONE_HTTP_HOME_KEYS, { keys: [...text] }, signal)
  }

  async swipe(direction: IphoneHomeSwipeDirection, point: IphonePoint, signal: AbortSignal): Promise<void> {
    const viewport = await this.session.rect(signal)
    signal.throwIfAborted()
    const distance = Math.round(viewport.width * IPHONE_HTTP_HOME_SWIPE_RATIO)
    const offset = direction === IPHONE_HTTP_HOME_LEFT ? distance : -distance
    await this.session.mobile(
      IPHONE_HTTP_HOME_DRAG,
      {
        fromX: point.x + offset,
        fromY: point.y,
        toX: point.x - offset,
        toY: point.y,
        duration: IPHONE_HTTP_HOME_SWIPE_SECONDS,
      },
      signal,
    )
  }

  async wait(milliseconds: number, signal: AbortSignal): Promise<void> {
    await this.session.wait(milliseconds, signal)
  }
}
