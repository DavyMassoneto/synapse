import { type ComputerDriverBinaryFolders } from "./types"

export const COMPUTER_DRIVER_BINARY_FOLDERS: ComputerDriverBinaryFolders = {
  darwin: ["CuaDriver.app", "Contents", "MacOS", "cua-driver"],
  linux: ["cua-driver"],
  win32: ["cua-driver.exe"],
}
