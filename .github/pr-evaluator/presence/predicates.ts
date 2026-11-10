import { type Nullable } from "./types"

export function isPresent<T>(value?: Nullable<T>): value is T {
  return value instanceof Object
}
