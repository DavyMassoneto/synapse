import {
  type IphoneHomeScreenPort,
  type IphoneHomeSwipeDirection,
} from "#synapse/modules/iphone/internal/home-screen-operations"
import { type IphonePointerAction } from "#synapse/modules/iphone/internal/pointer-gestures"
import { type IphoneElement, type IphonePoint, type IphoneRectangle } from "#synapse/modules/iphone/public/contracts"

export class IphoneHomeScriptedPort implements IphoneHomeScreenPort {
  private readonly states: IphoneElement[][]
  private index = 0
  actionsCount = 0
  tapsCount = 0
  swipesCount = 0

  constructor(states: IphoneElement[][]) {
    this.states = states
  }

  async viewport(_signal: AbortSignal): Promise<IphoneRectangle> {
    return { x: 0, y: 0, width: 440, height: 956 }
  }

  async elements(_signal: AbortSignal): Promise<IphoneElement[]> {
    const state = this.states[this.index]
    if (!state) {
      throw new Error("Estado de teste ausente")
    }
    return state
  }

  async actions(_actions: IphonePointerAction[], _signal: AbortSignal): Promise<void> {
    this.actionsCount++
    this.index++
  }

  async tap(_point: IphonePoint, _signal: AbortSignal): Promise<void> {
    this.tapsCount++
    this.index++
  }

  async type(_text: string, _signal: AbortSignal): Promise<void> {
    this.index++
  }

  async swipe(_direction: IphoneHomeSwipeDirection, _point: IphonePoint, _signal: AbortSignal): Promise<void> {
    this.swipesCount++
    this.index++
  }

  async wait(_milliseconds: number, _signal: AbortSignal): Promise<void> {}
}
