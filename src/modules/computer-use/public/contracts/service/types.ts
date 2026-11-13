import { type ComputerAction, type ComputerPlatform } from "../actions"
import {
  type ComputerApplication,
  type ComputerCaptureStorageResult,
  type ComputerElement,
  type ComputerImage,
  type ComputerWindow,
} from "../capture"
import { type ComputerDriverLaunch, type ComputerWaitPort } from "../driver"
import { type ComputerActionResult, type ComputerRecommendedAction, type ComputerVerdictDecision } from "../results"

export interface ComputerExecutionContext {
  sessionId: string
  modelSupportsImages: boolean
}

export interface ComputerExecutionVerdict {
  decision: ComputerVerdictDecision
  message?: string
  recommended?: ComputerRecommendedAction
  retryAllowed: boolean
}

export interface ComputerExecutedAction {
  kind: "computer-executed"
  result: ComputerActionResult
  verdict: ComputerExecutionVerdict
  capture?: ComputerRenderedScreenshot
  captureFailure?: string
  precedingEffects?: ComputerActionResult[]
}

export interface ComputerRenderedScreenshot {
  summary: string
  elements: ComputerElement[]
  totalElements: number
  truncatedElements: number
  image: ComputerImage
  omission: ComputerImageOmission
  scale: ComputerScreenshotScale
  screenshotStorage: ComputerCaptureStorageResult
  elementsStorage: ComputerCaptureStorageResult
}

export interface ComputerCapturedResponse {
  kind: "computer-captured"
  capture: ComputerRenderedScreenshot
}

export interface ComputerAppsListed {
  kind: "computer-apps-listed"
  applications: ComputerApplication[]
}

export interface ComputerWindowsListed {
  kind: "computer-windows-listed"
  windows: ComputerWindow[]
}

export type ComputerExecuteResult =
  | ComputerExecutedAction
  | ComputerCapturedResponse
  | ComputerAppsListed
  | ComputerWindowsListed

export interface ComputerReadyDiagnostic {
  kind: "computer-ready"
  binary: string
  version: string
}

export interface ComputerUnavailableDiagnostic {
  kind: "computer-unavailable"
  message: string
}

export type ComputerDiagnostic = ComputerReadyDiagnostic | ComputerUnavailableDiagnostic

export interface ComputerInstalled {
  kind: "computer-installed"
  binary: string
}

export interface ComputerInstallFailed {
  kind: "computer-install-failed"
  message: string
}

export type ComputerInstallResult = ComputerInstalled | ComputerInstallFailed

export interface ComputerUse {
  execute(
    action: ComputerAction,
    context: ComputerExecutionContext,
    signal?: AbortSignal,
  ): Promise<ComputerExecuteResult>
  diagnose(): Promise<ComputerDiagnostic>
  install(): Promise<ComputerInstallResult>
  stop(): Promise<void>
}

export interface ComputerUseDependencies {
  platform: ComputerPlatform
  installationDirectory: string
  captureDirectory: string
  wait: ComputerWaitPort
  environment: NodeJS.ProcessEnv
  driverPath?: string
  driverLaunch?: ComputerDriverLaunch
}

export interface ComputerImageIncluded {
  kind: "image-included"
}

export interface ComputerImageOmitted {
  kind: "image-omitted"
  reason: string
}

export type ComputerImageOmission = ComputerImageIncluded | ComputerImageOmitted

export interface ComputerScreenshotScaled {
  kind: "scale-present"
  factor: number
  maxX: number
  maxY: number
}

export interface ComputerScreenshotUnscaled {
  kind: "scale-absent"
}

export type ComputerScreenshotScale = ComputerScreenshotScaled | ComputerScreenshotUnscaled
