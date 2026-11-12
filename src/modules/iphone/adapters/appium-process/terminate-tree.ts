import {
  IPHONE_APPIUM_TASKKILL,
  IPHONE_APPIUM_TASKKILL_FORCE_FLAG,
  IPHONE_APPIUM_TASKKILL_PID_FLAG,
  IPHONE_APPIUM_TASKKILL_TREE_FLAG,
} from "./constants"
import { type IphoneAppiumExecutor, type IphoneAppiumSpawnCommand } from "./types"

export function iphoneAppiumKillCommand(pid: number): IphoneAppiumSpawnCommand {
  return {
    command: IPHONE_APPIUM_TASKKILL,
    arguments: [
      IPHONE_APPIUM_TASKKILL_PID_FLAG,
      String(pid),
      IPHONE_APPIUM_TASKKILL_TREE_FLAG,
      IPHONE_APPIUM_TASKKILL_FORCE_FLAG,
    ],
  }
}

export async function terminateIphoneAppiumTree(pid: number, executor: IphoneAppiumExecutor): Promise<void> {
  const command = iphoneAppiumKillCommand(pid)
  await executor(command.command, command.arguments)
}
