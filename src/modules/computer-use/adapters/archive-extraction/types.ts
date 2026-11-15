import { type ComputerPlatform } from "#synapse/modules/computer-use/public/contracts"

export interface ComputerArchiveRequest {
  archive: string
  directory: string
  platform: ComputerPlatform
  environment: NodeJS.ProcessEnv
}

export interface ComputerArchiveTarRequest {
  platform: ComputerPlatform
  environment: NodeJS.ProcessEnv
}

export interface ComputerArchiveTarResolved {
  kind: "tar-resolved"
  command: string
}

export interface ComputerArchiveTarMissing {
  kind: "tar-missing"
  message: string
}

export type ComputerArchiveTarResult = ComputerArchiveTarResolved | ComputerArchiveTarMissing

export interface ComputerArchiveExtracted {
  kind: "archive-extracted"
}

export interface ComputerArchiveRefused {
  kind: "archive-refused"
  message: string
}

export type ComputerArchiveExtractionResult = ComputerArchiveExtracted | ComputerArchiveRefused
