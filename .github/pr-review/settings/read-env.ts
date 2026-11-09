import { MISSING_ENV } from "./constants"

export function readEnv(name: string): string {
  const value = process.env[name]
  if (typeof value !== "string") {
    throw new Error(MISSING_ENV + name)
  }
  return value
}
