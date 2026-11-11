import { type Static } from "typebox"
import { type GREP_NO_MATCHES, type GREP_OUTPUT, type GREP_TOO_LARGE, type ReadFileArguments } from "./constants"

export type SnapshotFiles = Set<string>

export interface RepositorySnapshot {
  sha: string
  files: SnapshotFiles
}

export type ReadFileRequest = Static<typeof ReadFileArguments>

export interface InspectionItemsPresentation {
  maximum: number
  more: string
  empty: string
}

export interface InspectionGrepOutput {
  kind: typeof GREP_OUTPUT
  text: string
}

export interface InspectionGrepTooLarge {
  kind: typeof GREP_TOO_LARGE
}

export interface InspectionGrepNoMatches {
  kind: typeof GREP_NO_MATCHES
}

export type InspectionGrepResult = InspectionGrepOutput | InspectionGrepTooLarge | InspectionGrepNoMatches
