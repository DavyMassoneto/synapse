import { type ClassifierOutcome, type RouteRequest } from "#synapse/modules/model-router"
import { type RouterTestSelected, type RouterTestUnavailable } from "./types"

export const ROUTER_TEST_REQUEST: RouteRequest = {
  messages: [{ role: "user", text: "Revise a implementação", image: false, calls: [] }],
  candidates: [
    {
      provider: "omniroute",
      authorized: true,
      id: "first",
      name: "Primeiro",
      input: ["text", "image"],
      contextWindow: 100000,
      maxTokens: 10000,
      efforts: ["high"],
    },
    {
      provider: "omniroute",
      authorized: true,
      id: "second",
      name: "Segundo",
      input: ["text", "image"],
      contextWindow: 100000,
      maxTokens: 10000,
      efforts: ["high"],
    },
  ],
}

export const ROUTER_TEST_VALID_CHOICE: ClassifierOutcome = {
  kind: "choice",
  choice: "second",
  probabilities: [
    { option: "first", probability: 0.2 },
    { option: "second", probability: 0.8 },
  ],
}

export const ROUTER_TEST_DUPLICATE_CHOICE: ClassifierOutcome = {
  kind: "choice",
  choice: "first",
  probabilities: [
    { option: "first", probability: 0.5 },
    { option: "first", probability: 0.5 },
  ],
}

export const ROUTER_TEST_RANGE_CHOICE: ClassifierOutcome = {
  kind: "choice",
  choice: "second",
  probabilities: [
    { option: "first", probability: -0.2 },
    { option: "second", probability: 1.2 },
  ],
}

export const ROUTER_TEST_SUM_CHOICE: ClassifierOutcome = {
  kind: "choice",
  choice: "second",
  probabilities: [
    { option: "first", probability: 0.2 },
    { option: "second", probability: 0.5 },
  ],
}

export const ROUTER_TEST_LESSER_CHOICE: ClassifierOutcome = {
  kind: "choice",
  choice: "first",
  probabilities: [
    { option: "first", probability: 0.2 },
    { option: "second", probability: 0.8 },
  ],
}

export const ROUTER_TEST_CREDENTIAL_TEXT =
  "password=hunter2 sk-abcdefghijklmnop ghp_abcdefghijklmnop eyJheader.payload.signature op://vault/item/field\n-----BEGIN RSA PRIVATE KEY-----\nsecret material\n-----END RSA PRIVATE KEY-----"

export const ROUTER_TEST_SELECTED: RouterTestSelected = { kind: "selected", modelId: "second", effort: "high" }

export const ROUTER_TEST_UNAVAILABLE: RouterTestUnavailable = { kind: "unavailable" }

export const ROUTER_TEST_USER_ROLE = "user"

export const ROUTER_TEST_UNREDACTED_CREDENTIALS =
  /hunter2|abcdefghijklmnop|eyJheader|vault\/item|secret material|BEGIN RSA/

export const ROUTER_TEST_CREDENTIAL_MASK = "[credencial removida]"

export const ROUTER_TEST_PRIVATE_KEY_MASK = "[chave privada removida]"

export const ROUTER_TEST_MISSING_REQUEST = "O classificador não recebeu o pedido."
