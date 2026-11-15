export interface UnixLauncherAsset {
  name: string
  sha256: string
  archiveSha256: string
}
export interface UnixLauncherTargets {
  darwin: UnixLauncherAsset
  linuxX64: UnixLauncherAsset
  linuxArm64: UnixLauncherAsset
}
export type UnixLauncherProbeError = Error | null
export type UnixLauncherProbeResolve = (output: string) => void
export type UnixLauncherProbeReject = (error: Error) => void

export interface UnixLauncherProbeOptions {
  signal?: AbortSignal
}
