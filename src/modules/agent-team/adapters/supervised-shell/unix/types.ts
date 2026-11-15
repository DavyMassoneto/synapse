export type UnixShellExitStatus = number | null
export type UnixShellExitSignal = NodeJS.Signals | null

export type UnixGroupResolve = (groups: string) => void
export type UnixGroupReject = (error: Error) => void
export type UnixGroupReadError = Error | null
