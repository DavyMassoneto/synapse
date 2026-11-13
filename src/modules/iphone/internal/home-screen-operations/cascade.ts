import {
  IPHONE_ACCEPTED,
  IPHONE_HOME_PAGE_KNOWN,
  IPHONE_REFUSED,
  type IphoneHomeScreenPort,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import { IPHONE_HOME_CASCADE_ABSENT, IPHONE_HOME_CASCADE_FAILURE } from "./constants"
import { gotoIphoneHomePage } from "./goto"
import { readIphoneHomeScreen } from "./read"
import { type IphoneHomeCascadeSnapshot, type IphoneHomeHopRequest } from "./types"

export async function snapshotIphoneCascade(
  port: IphoneHomeScreenPort,
  request: IphoneHomeHopRequest,
  signal: AbortSignal,
): Promise<IphoneHomeCascadeSnapshot> {
  const state = await readIphoneHomeScreen(port, signal)
  if (state.kind === IPHONE_REFUSED) {
    return state
  }
  if (state.page.kind !== IPHONE_HOME_PAGE_KNOWN) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_CASCADE_FAILURE }
  }
  const total = state.edit && state.page.total > 1 ? state.page.total - 1 : state.page.total
  const next = request.to + (request.to > request.from ? 1 : -1)
  if (next < 1 || next > total) {
    return { kind: IPHONE_HOME_CASCADE_ABSENT }
  }
  const go = await gotoIphoneHomePage(port, next, signal)
  if (go.kind === IPHONE_REFUSED) {
    return go
  }
  const nextState = await readIphoneHomeScreen(port, signal)
  if (nextState.kind === IPHONE_REFUSED) {
    return nextState
  }
  return { kind: IPHONE_ACCEPTED, page: next, count: nextState.layout.icons.length }
}

export async function verifyIphoneCascade(
  port: IphoneHomeScreenPort,
  snapshot: IphoneHomeCascadeSnapshot,
  destination: number,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  if (snapshot.kind === IPHONE_REFUSED) {
    return snapshot
  }
  if (snapshot.kind === IPHONE_HOME_CASCADE_ABSENT) {
    return { kind: IPHONE_ACCEPTED }
  }
  const go = await gotoIphoneHomePage(port, snapshot.page, signal)
  if (go.kind === IPHONE_REFUSED) {
    return go
  }
  const after = await readIphoneHomeScreen(port, signal)
  if (after.kind === IPHONE_REFUSED) {
    return after
  }
  if (after.layout.icons.length !== snapshot.count) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_CASCADE_FAILURE }
  }
  return gotoIphoneHomePage(port, destination, signal)
}
