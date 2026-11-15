import { setTimeout } from "node:timers/promises"

export function computerUnityBridgeDelay(milliseconds: number): Promise<void> {
  return setTimeout(milliseconds)
}
