import { type ResponseRulesTestHost } from "./host"

export interface ResponseRulesIntegrationSut {
  host: ResponseRulesTestHost
  directory: string
  path: string
}
