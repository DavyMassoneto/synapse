import { isUnsupportedIphoneOperation } from "./predicates"
import { type IphoneFallbackOperation } from "./types"

export async function executeIphoneFallback(
  primary: IphoneFallbackOperation,
  alternative: IphoneFallbackOperation,
  signal: AbortSignal,
): Promise<void> {
  try {
    await primary()
  } catch (error) {
    signal.throwIfAborted()
    if (!(error instanceof Error) || !isUnsupportedIphoneOperation(error)) {
      throw error
    }
    await alternative()
  }
}
