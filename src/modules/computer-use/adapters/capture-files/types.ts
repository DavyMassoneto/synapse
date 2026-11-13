export interface ComputerCaptureFileImageExtensions {
  "image/png": string
  "image/jpeg": string
}

export interface ComputerCaptureFileEntry {
  name: string
  modified: number
}

export type ComputerCaptureFileData = Buffer | string
