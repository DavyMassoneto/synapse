import { type EnvironmentSnapshot } from "./types"

export function snapshotEnvironment(): EnvironmentSnapshot {
  const snapshot: EnvironmentSnapshot = {}
  const home = process.env.HOME
  if (typeof home === "string") {
    snapshot.home = home
  }
  const profile = process.env.USERPROFILE
  if (typeof profile === "string") {
    snapshot.profile = profile
  }
  return snapshot
}
