import { type RouterCandidate } from "#synapse/modules/model-router"
import {
  ROUTER_DOUBLE_HIGH,
  ROUTER_DOUBLE_IMAGE,
  ROUTER_DOUBLE_LOW,
  ROUTER_DOUBLE_PROVIDER,
  ROUTER_DOUBLE_TEXT,
} from "./constants"

export function routerTestCandidate(id: string): RouterCandidate {
  return {
    provider: ROUTER_DOUBLE_PROVIDER,
    authorized: true,
    id,
    name: id,
    input: [ROUTER_DOUBLE_TEXT, ROUTER_DOUBLE_IMAGE],
    contextWindow: 100000,
    maxTokens: 10000,
    efforts: [ROUTER_DOUBLE_LOW, ROUTER_DOUBLE_HIGH],
  }
}
