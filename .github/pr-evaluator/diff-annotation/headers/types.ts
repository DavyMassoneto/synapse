export interface HunkStart {
  oldLine: number
  newLine: number
}

export interface OldPathHeader {
  kind: "old"
  path: string
}

export interface NewPathHeader {
  kind: "new"
  path: string
}

export interface DeletedPathHeader {
  kind: "deleted"
}

export type PathHeader = OldPathHeader | NewPathHeader | DeletedPathHeader
