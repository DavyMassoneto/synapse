import { type Static } from "typebox"
import { type ReadFileArguments } from "./constants"

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
