export interface ComputerReleaseTestRoute {
  url: string
  status: number
  body: string
  etag?: string
  headers?: Headers
}

export interface ComputerReleaseTestRequest {
  url: string
  headers: Headers
}

export interface ComputerReleaseTestChecksumEntry {
  name: string
  sha256: string
}

export type ComputerReleaseTestDigest = string | null

export interface ComputerReleaseTestStreamState {
  cancelled: boolean
  pulls: number
}
