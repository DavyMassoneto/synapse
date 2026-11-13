import { type RouteSelected, type RouteUnavailable } from "#synapse/modules/model-router"

export type RouterTestSelectedFields = "kind" | "modelId" | "effort"

export type RouterTestSelected = Pick<RouteSelected, RouterTestSelectedFields>

export type RouterTestUnavailable = Pick<RouteUnavailable, "kind">
