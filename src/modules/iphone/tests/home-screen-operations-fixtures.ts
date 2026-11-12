import { type IphoneElement } from "#synapse/modules/iphone/public/contracts"

export const IPHONE_HOME_TEST_PAGE: IphoneElement = {
  index: 0,
  type: "PageIndicator",
  name: "",
  label: "",
  value: "Página 1 de 2",
  rect: { x: 0, y: 0, width: 1, height: 1 },
  enabled: true,
  interactive: false,
}

export const IPHONE_HOME_TEST_PAGE_TWO: IphoneElement = { ...IPHONE_HOME_TEST_PAGE, value: "Página 2 de 2" }

export const IPHONE_HOME_TEST_FOLDER: IphoneElement = {
  index: 1,
  type: "Icon",
  name: "Trabalho",
  label: "pasta Trabalho",
  value: "1 app",
  rect: { x: 35, y: 92, width: 68, height: 68 },
  enabled: true,
  interactive: true,
}

export const IPHONE_HOME_TEST_APP: IphoneElement = {
  index: 2,
  type: "Icon",
  name: "Notas",
  label: "Notas",
  value: "",
  rect: { x: 35, y: 92, width: 68, height: 68 },
  enabled: true,
  interactive: true,
}

export const IPHONE_HOME_TEST_INSIDE: IphoneElement = {
  index: 3,
  type: "TextField",
  name: "Nome da pasta",
  label: "Nome da pasta",
  value: "Trabalho",
  rect: { x: 0, y: 0, width: 1, height: 1 },
  enabled: true,
  interactive: true,
}

export const IPHONE_HOME_TEST_EDIT: IphoneElement = {
  index: 4,
  type: "Button",
  name: "OK",
  label: "OK",
  value: "",
  rect: { x: 350, y: 20, width: 40, height: 30 },
  enabled: true,
  interactive: true,
}
