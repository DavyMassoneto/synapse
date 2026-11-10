import { type Nullable } from "./types"

export function isPresentObject<T>(value?: Nullable<T>): value is T {
  return value instanceof Object
}
