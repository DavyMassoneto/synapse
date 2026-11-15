import { type StdioOptions } from "node:child_process"

export type ShellTestStdioOptions = StdioOptions

export interface CompiledNativeSpec {
  directoryPrefix: string
  executable: string
  fixture: string
  sources: string[]
}

export interface NativeTargetCase {
  platform: NativeTargetPlatform
  architecture: NativeTargetArchitecture
  asset: NativeTargetAsset
}
export interface NativeTargetRejection {
  platform: NodeJS.Platform
  architecture: typeof process.arch
  message: string
}

export type NativeTargetPlatform = "darwin" | "linux"
export type NativeTargetArchitecture = "arm64" | "x64"
export type NativeTargetAsset = "darwin" | "linuxX64" | "linuxArm64"
