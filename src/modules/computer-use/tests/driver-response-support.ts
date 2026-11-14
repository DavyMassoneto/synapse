import { computerParseRpcResponse } from "../adapters"
import { type ComputerActionEvidence, type ComputerJudgedAction, computerJudgeAction } from "../internal"
import { COMPUTER_CAPTURE, type ComputerDriverEnvelope } from "../public"

export function computerTestRpcKind(state: string): string {
  const line = `{"jsonrpc":"2.0","id":1,"result":{"content":[],"structuredContent":${state}}}`
  return computerParseRpcResponse(line).kind
}

export function computerJudgeTestEnvelope(envelope: ComputerDriverEnvelope): ComputerJudgedAction {
  const evidence: ComputerActionEvidence = {
    action: COMPUTER_CAPTURE,
    ok: !envelope.isError,
    message: envelope.message,
  }
  if (envelope.code) {
    evidence.code = envelope.code
  }
  return computerJudgeAction(evidence)
}
