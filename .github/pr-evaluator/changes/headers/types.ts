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

export interface NoPathHeader {
  kind: "none"
}

export type PathHeader = OldPathHeader | NewPathHeader | DeletedPathHeader | NoPathHeader
