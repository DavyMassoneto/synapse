import { type NativeTargetCase, type NativeTargetRejection } from "./native-test-types"
export const SHELL_NATIVE_TARGET_TITLE = "asset selecionado por plataforma e arquitetura: %o"
export const SHELL_NATIVE_TARGET_REJECT_TITLE = "alvo sem asset é recusado antes de provisionar: %o"
export const SHELL_NATIVE_TARGET_CASES: NativeTargetCase[] = [
  { platform: "darwin", architecture: "arm64", asset: "darwin" },
  { platform: "darwin", architecture: "x64", asset: "darwin" },
  { platform: "linux", architecture: "arm64", asset: "linuxArm64" },
  { platform: "linux", architecture: "x64", asset: "linuxX64" },
]
export const SHELL_NATIVE_TARGET_REJECTIONS: NativeTargetRejection[] = [
  { platform: "aix", architecture: "x64", message: "Não há launcher Unix publicado para esta arquitetura." },
  { platform: "linux", architecture: "ia32", message: "Não há launcher Unix publicado para esta arquitetura." },
]
export const SHELL_NATIVE_PLATFORM_PROPERTY = "platform"
export const SHELL_NATIVE_ARCHITECTURE_PROPERTY = "arch"
export const SHELL_NATIVE_PROPERTY_GETTER = "get"
