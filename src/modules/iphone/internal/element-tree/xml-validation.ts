import { IPHONE_ACCEPTED, IPHONE_REFUSED, type IphoneSupportResult } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_XML_CDATA,
  IPHONE_XML_CLOSE,
  IPHONE_XML_COMMENT,
  IPHONE_XML_DECLARATION,
  IPHONE_XML_ERROR,
  IPHONE_XML_INVALID_ENTITY,
  IPHONE_XML_OPEN,
  IPHONE_XML_SELF_CLOSE,
  IPHONE_XML_TAG_START,
  IPHONE_XML_TOKEN,
} from "./constants"
import { type IphoneXmlState } from "./types"

function consumeIphoneXmlToken(text: string, state: IphoneXmlState): IphoneSupportResult {
  if (IPHONE_XML_COMMENT.test(text) || IPHONE_XML_CDATA.test(text)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_XML_ERROR }
  }
  if (IPHONE_XML_DECLARATION.test(text) && state.roots === 0) {
    return { kind: IPHONE_ACCEPTED }
  }
  const opening = IPHONE_XML_OPEN.exec(text)
  if (opening?.[1]) {
    if (state.stack.length === 0) {
      state.roots++
    }
    if (opening[2] !== IPHONE_XML_SELF_CLOSE) {
      state.stack.push(opening[1])
    }
    return { kind: IPHONE_ACCEPTED }
  }
  const closing = IPHONE_XML_CLOSE.exec(text)
  if (closing?.[1] && state.stack.pop() === closing[1]) {
    return { kind: IPHONE_ACCEPTED }
  }
  if (!text.startsWith(IPHONE_XML_TAG_START) && (state.stack.length > 0 || !text.trim())) {
    return { kind: IPHONE_ACCEPTED }
  }
  return { kind: IPHONE_REFUSED, message: IPHONE_XML_ERROR }
}

export function validateIphoneXml(xml: string): IphoneSupportResult {
  if (IPHONE_XML_INVALID_ENTITY.test(xml)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_XML_ERROR }
  }
  const state: IphoneXmlState = { stack: [], roots: 0 }
  let consumed = 0
  for (const token of xml.matchAll(IPHONE_XML_TOKEN)) {
    consumed += token[0].length
    const result = consumeIphoneXmlToken(token[0], state)
    if (result.kind === IPHONE_REFUSED) {
      return result
    }
  }
  if (consumed !== xml.length || state.stack.length || state.roots !== 1) {
    return { kind: IPHONE_REFUSED, message: IPHONE_XML_ERROR }
  }
  return { kind: IPHONE_ACCEPTED }
}
