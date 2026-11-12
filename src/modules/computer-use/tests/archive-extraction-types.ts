export interface ComputerArchiveExtractionSut {
  directory: string
  source: string
  archive: string
  destination: string
}

export interface ComputerArchiveTestCall {
  command: string
  arguments: string[]
}
