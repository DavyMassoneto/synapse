import { type IphonePoint, type IphoneRectangle } from "#synapse/modules/iphone/public/contracts"

export function iphoneElementCenter(rect: IphoneRectangle): IphonePoint {
  return {
    x: Math.round(rect.x + rect.width / 2),
    y: Math.round(rect.y + rect.height / 2),
  }
}
