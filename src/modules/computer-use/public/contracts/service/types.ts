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
import {
  type COMPUTER_APPS_LISTED,
  type COMPUTER_CAPTURED,
  type COMPUTER_DIAGNOSTIC_READY,
  type COMPUTER_DIAGNOSTIC_UNAVAILABLE,
  type COMPUTER_EXECUTED,
  type COMPUTER_INSTALL_FAILED,
  type COMPUTER_INSTALL_SUCCEEDED,
  type COMPUTER_PUBLIC_IMAGE_INCLUDED,
  type COMPUTER_PUBLIC_IMAGE_OMITTED,
  type COMPUTER_PUBLIC_SCALE_ABSENT,
  type COMPUTER_PUBLIC_SCALE_PRESENT,
  type COMPUTER_WINDOWS_LISTED,
} from "./constants"

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
  kind: typeof COMPUTER_EXECUTED
  result: ComputerActionResult
  verdict: ComputerExecutionVerdict
  capture?: ComputerRenderedScreenshot
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
  kind: typeof COMPUTER_CAPTURED
  capture: ComputerRenderedScreenshot
}

export interface ComputerAppsListed {
  kind: typeof COMPUTER_APPS_LISTED
  applications: ComputerApplication[]
}

export interface ComputerWindowsListed {
  kind: typeof COMPUTER_WINDOWS_LISTED
  windows: ComputerWindow[]
}

export type ComputerExecuteResult =
  | ComputerExecutedAction
  | ComputerCapturedResponse
  | ComputerAppsListed
  | ComputerWindowsListed

export interface ComputerReadyDiagnostic {
  kind: typeof COMPUTER_DIAGNOSTIC_READY
  binary: string
  version: string
}

export interface ComputerUnavailableDiagnostic {
  kind: typeof COMPUTER_DIAGNOSTIC_UNAVAILABLE
  message: string
}

export type ComputerDiagnostic = ComputerReadyDiagnostic | ComputerUnavailableDiagnostic

export interface ComputerInstalled {
  kind: typeof COMPUTER_INSTALL_SUCCEEDED
  binary: string
}

export interface ComputerInstallFailed {
  kind: typeof COMPUTER_INSTALL_FAILED
  message: string
}

export type ComputerInstallResult = ComputerInstalled | ComputerInstallFailed

export interface ComputerUse {
  execute(action: ComputerAction, context: ComputerExecutionContext): Promise<ComputerExecuteResult>
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
  kind: typeof COMPUTER_PUBLIC_IMAGE_INCLUDED
}

export interface ComputerImageOmitted {
  kind: typeof COMPUTER_PUBLIC_IMAGE_OMITTED
  reason: string
}

export type ComputerImageOmission = ComputerImageIncluded | ComputerImageOmitted

export interface ComputerScreenshotScaled {
  kind: typeof COMPUTER_PUBLIC_SCALE_PRESENT
  factor: number
  maxX: number
  maxY: number
}

export interface ComputerScreenshotUnscaled {
  kind: typeof COMPUTER_PUBLIC_SCALE_ABSENT
}

export type ComputerScreenshotScale = ComputerScreenshotScaled | ComputerScreenshotUnscaled
