import { type IphoneElement } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_TEST_APP,
  IPHONE_HOME_TEST_FOLDER,
  IPHONE_HOME_TEST_INSIDE,
} from "./home-screen-operations-fixtures"

export const IPHONE_HOME_EXTRA_APP: IphoneElement = {
  ...IPHONE_HOME_TEST_APP,
  name: "Fotos",
  label: "Fotos",
  rect: { ...IPHONE_HOME_TEST_APP.rect, x: 136 },
}

export const IPHONE_HOME_EXTRA_FOLDER: IphoneElement = { ...IPHONE_HOME_TEST_FOLDER, value: "2 apps" }

export const IPHONE_HOME_EXTRA_AUTOFOLDER: IphoneElement = {
  ...IPHONE_HOME_EXTRA_FOLDER,
  name: "Nova",
  label: "pasta Nova",
  rect: { ...IPHONE_HOME_TEST_FOLDER.rect, x: 136 },
}

export const IPHONE_HOME_EXTRA_NAMED_FOLDER: IphoneElement = {
  ...IPHONE_HOME_EXTRA_FOLDER,
  name: "Casa",
  label: "pasta Casa",
}

export const IPHONE_HOME_EXTRA_RENAMED: IphoneElement = { ...IPHONE_HOME_TEST_INSIDE, value: "Casa" }

export const IPHONE_HOME_EXTRA_CLEAR: IphoneElement = {
  ...IPHONE_HOME_TEST_INSIDE,
  type: "Button",
  name: "Limpar texto",
  label: "Limpar texto",
}

export const IPHONE_HOME_EXTRA_DELETE: IphoneElement = {
  ...IPHONE_HOME_EXTRA_CLEAR,
  name: "DeleteButton",
  label: "DeleteButton",
}
