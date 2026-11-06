import { createService } from "../internal/service.ts";
import { AppiumServer, Session, bootedSimulator, listDevices, loadConfig, CONFIG_PATH } from "../adapters/appium.ts";
import { management } from "../adapters/management.ts";
export function createIphone() { return createService({ AppiumServer, Session, bootedSimulator, listDevices, loadConfig, CONFIG_PATH, management }); }
