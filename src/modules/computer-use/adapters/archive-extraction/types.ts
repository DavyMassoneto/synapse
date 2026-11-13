export interface ComputerArchiveRequest {
  archive: string
  directory: string
}

export interface ComputerArchiveExtracted {
  kind: "archive-extracted"
}

export interface ComputerArchiveRefused {
  kind: "archive-refused"
  message: string
}

export type ComputerArchiveExtractionResult = ComputerArchiveExtracted | ComputerArchiveRefused
