import { computerParseRpcResponse } from "../adapters"

export function computerTestRpcKind(state: string): string {
  const line = `{"jsonrpc":"2.0","id":1,"result":{"content":[],"structuredContent":${state}}}`
  return computerParseRpcResponse(line).kind
}
