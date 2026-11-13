import { IphoneModuleService } from "#synapse/modules/iphone/internal/module-service"
import { type IphoneModule, type IphoneModuleDependencies } from "./contracts"
import { IphoneSystemInfrastructure } from "./infrastructure"

export function createIphone(dependencies: IphoneModuleDependencies): IphoneModule {
  return new IphoneModuleService(dependencies, new IphoneSystemInfrastructure(dependencies))
}
