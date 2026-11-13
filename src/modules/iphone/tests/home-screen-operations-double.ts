import {
  type IphoneElement,
  type IphoneHomeScreenPort,
  type IphoneHomeSwipeDirection,
  type IphonePoint,
  type IphonePointerAction,
  type IphoneRectangle,
} from "#synapse/modules/iphone/public/contracts"

export class IphoneHomeOperationsDouble implements IphoneHomeScreenPort {
  edit = false
  change = true
  width = 440
  page = 1

  async viewport(_signal: AbortSignal): Promise<IphoneRectangle> {
    return { x: 0, y: 0, width: this.width, height: 956 }
  }

  async elements(_signal: AbortSignal): Promise<IphoneElement[]> {
    if (this.edit) {
      return [
        {
          index: 0,
          type: "Button",
          name: "OK",
          label: "OK",
          value: "",
          rect: { x: 350, y: 20, width: 40, height: 30 },
          enabled: true,
          interactive: true,
        },
      ]
    }
    return [
      {
        index: 1,
        type: "PageIndicator",
        name: "",
        label: "",
        value: `Página ${this.page} de 2`,
        rect: { x: 0, y: 0, width: 1, height: 1 },
        enabled: true,
        interactive: false,
      },
    ]
  }

  async actions(_actions: IphonePointerAction[], _signal: AbortSignal): Promise<void> {
    if (this.change) {
      this.edit = true
    }
  }

  async tap(_point: IphonePoint, _signal: AbortSignal): Promise<void> {
    if (this.change) {
      this.edit = false
    }
  }

  async type(_text: string, _signal: AbortSignal): Promise<void> {}

  async swipe(direction: IphoneHomeSwipeDirection, _point: IphonePoint, _signal: AbortSignal): Promise<void> {
    if (this.change) {
      this.page += direction === "left" ? 1 : -1
    }
  }

  async wait(_milliseconds: number, _signal: AbortSignal): Promise<void> {}
}
