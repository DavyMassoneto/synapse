export interface ChangedFile {
  path: string
  addedLines: Set<number>
  commentableLines: Set<number>
}

export interface LineNumbers {
  added: Set<number>
  commentable: Set<number>
}

export type OptionalNumber = number | undefined

export type OptionalPath = string | undefined

export type OptionalChangedFile = ChangedFile | undefined
