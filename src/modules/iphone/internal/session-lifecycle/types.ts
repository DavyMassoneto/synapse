export type IphoneMaybeSession<S> = S | null

import { type IphoneSessionPort } from "#synapse/modules/iphone/public/contracts"

export type IphoneSessionOperation<S, T> = (session: S, signal: AbortSignal) => Promise<T>

export interface IphoneSessionLifecycle<S extends IphoneSessionPort> {
  execute<T>(operation: IphoneSessionOperation<S, T>, signal: AbortSignal): Promise<T>
  invalidate(): void
  shutdown(): Promise<void>
}
