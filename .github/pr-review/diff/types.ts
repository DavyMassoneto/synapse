export interface ChangedFile {
  path: string
  addedLines: Set<number>
  commentableLines: Set<number>
}

export type OptionalChangedFile = ChangedFile | undefined
