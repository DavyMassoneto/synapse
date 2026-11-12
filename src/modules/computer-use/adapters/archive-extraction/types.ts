import { type COMPUTER_ARCHIVE_EXTRACTED, type COMPUTER_ARCHIVE_REFUSED } from "./constants"

export interface ComputerArchiveRequest {
  archive: string
  directory: string
}

export interface ComputerArchiveExtracted {
  kind: typeof COMPUTER_ARCHIVE_EXTRACTED
}

export interface ComputerArchiveRefused {
  kind: typeof COMPUTER_ARCHIVE_REFUSED
  message: string
}

export type ComputerArchiveExtractionResult = ComputerArchiveExtracted | ComputerArchiveRefused
