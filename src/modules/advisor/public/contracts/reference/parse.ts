import type { ModelReference } from "./types";

export function parseModelReference(reference: string): ModelReference | undefined {
  const separator = reference.indexOf("/");
  if (separator <= 0 || separator === reference.length - 1) {
    return undefined;
  }
  return { provider: reference.slice(0, separator), id: reference.slice(separator + 1) };
}
