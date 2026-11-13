import { type IphoneSimulatorDevice } from "#synapse/modules/iphone/adapters/simctl-device-list-reading"
import { type IphoneSimctlInvalidCase, type IphoneSimctlValidCase } from "./types"

export const SIMCTL_DEVICE_JSON = '{"udid":"a","name":"iPhone","state":"Booted"}'
export const SIMCTL_DEVICE: IphoneSimulatorDevice = { udid: "a", name: "iPhone", state: "Booted" }
export const SIMCTL_DEEP_NESTING = 10000
export const SIMCTL_DEEP_EXTRA = `${'[{"key":'.repeat(SIMCTL_DEEP_NESTING)}null${"}]".repeat(SIMCTL_DEEP_NESTING)}`
export const SIMCTL_DEEP_SOURCE = `{"extra":${SIMCTL_DEEP_EXTRA},"devices":{"r":[${SIMCTL_DEVICE_JSON}]}}`
export const SIMCTL_MALFORMED_DEEP_EXTRA = `${"[".repeat(SIMCTL_DEEP_NESTING)}0,${"]".repeat(SIMCTL_DEEP_NESTING)}`
export const SIMCTL_MALFORMED_DEEP_SOURCE = `{"devices":{},"extra":${SIMCTL_MALFORMED_DEEP_EXTRA}}`
export const SIMCTL_SCENARIO_NAME = "$scenario"
export const SIMCTL_DEEP_SCENARIO = "lê extra de vinte mil níveis sem recursão"
export const SIMCTL_MALFORMED_DEEP_SCENARIO = "recusa sintaxe inválida em extra de dez mil níveis"
export const SIMCTL_VALID_CASES: IphoneSimctlValidCase[] = [
  {
    scenario: "aceita toda gramática numérica sem converter extras",
    source: '{"extra":[0,-0,12,-12,0.5,-0.5,1e2,1E-2,1e+2,1e999],"devices":{}}',
    devices: [],
  },
  {
    scenario: "aceita chaves especiais de objeto sem herdar protótipo",
    source: `{"__proto__":{"x":1},"devices":{"__proto__":[${SIMCTL_DEVICE_JSON}],"constructor":[],"toString":[]}}`,
    devices: [SIMCTL_DEVICE],
  },
  {
    scenario: "classifica limite de índices e não trata zero inicial como índice",
    source:
      '{"devices":{"4294967295":[{"udid":"first","name":"first","state":"Booted"}],"01":[{"udid":"second","name":"second","state":"Booted"}],"4294967294":[{"udid":"index","name":"index","state":"Booted"}]}}',
    devices: [
      { udid: "index", name: "index", state: "Booted" },
      { udid: "first", name: "first", state: "Booted" },
      { udid: "second", name: "second", state: "Booted" },
    ],
  },
  { scenario: "aceita mapa vazio", source: '{"devices":{}}', devices: [] },
  { scenario: "aceita espaços JSON", source: ' \t\r\n{"devices":{}}\n', devices: [] },
  {
    scenario: "aceita extras aninhados na raiz e no aparelho",
    source:
      '{"other":{"a":[null,true,false,-1.25e+2,{"b":[]}]},"devices":{"r":[{"name":"iPhone","extra":[{"state":4}],"state":"Booted","udid":"a"}]}}',
    devices: [SIMCTL_DEVICE],
  },
  {
    scenario: "aceita nomes, campos e runtime escapados",
    source: '{"dev\\u0069ces":{"r\\u0031":[{"ud\\u0069d":"a","name":"iPhone","state":"Booted"}]},"ex\\u0074ra":{}}',
    devices: [SIMCTL_DEVICE],
  },
  {
    scenario: "preserva strings vazias e estado futuro",
    source:
      '{"devices":{"future":[{"state":"Future","name":"","udid":""}],"empty":[{"udid":"","name":"","state":""}]}}',
    devices: [
      { udid: "", name: "", state: "Future" },
      { udid: "", name: "", state: "" },
    ],
  },
  {
    scenario: "decodifica escapes, emoji e surrogates sem normalizar",
    source: String.raw`{"devices":{"r":[{"udid":"a","name":"(iPhone) \" \\ \/ \b\f\n\r\t 📱 \ud83d\udcf1 \ud83d \udcf1","state":"Booted"}]}}`,
    devices: [{ udid: "a", name: '(iPhone) " \\ / \b\f\n\r\t 📱 📱 \ud83d \udcf1', state: "Booted" }],
  },
  {
    scenario: "campo inválido seguido de válido usa último valor",
    source: '{"devices":{"r":[{"udid":{},"udid":"a","name":null,"name":"iPhone","state":[1],"state":"Booted"}]}}',
    devices: [SIMCTL_DEVICE],
  },
  {
    scenario: "runtime inválido seguido de válido usa último valor",
    source: `{"devices":{"r":[{"udid":7}],"s":[],"r":[${SIMCTL_DEVICE_JSON}]}}`,
    devices: [SIMCTL_DEVICE],
  },
  {
    scenario: "devices inválido seguido de válido usa último valor",
    source: `{"devices":[false],"devices":{"r":[${SIMCTL_DEVICE_JSON}]}}`,
    devices: [SIMCTL_DEVICE],
  },
  {
    scenario: "devices com grupo inválido substituído por mapa válido",
    source: `{"devices":{"r":[null]},"devices":{"r":[${SIMCTL_DEVICE_JSON}]}}`,
    devices: [SIMCTL_DEVICE],
  },
  {
    scenario: "runtimes em ordem numérica depois ordem de inserção com duplicata",
    source:
      '{"devices":{"z":[{"udid":"old","name":"z","state":"Booted"}],"1":[{"udid":"one","name":"1","state":"Booted"}],"a":[{"udid":"last","name":"a","state":"Booted"}],"0":[{"udid":"zero","name":"0","state":"Booted"}],"z":[{"udid":"new","name":"z","state":"Booted"}]}}',
    devices: [
      { udid: "zero", name: "0", state: "Booted" },
      { udid: "one", name: "1", state: "Booted" },
      { udid: "new", name: "z", state: "Booted" },
      { udid: "last", name: "a", state: "Booted" },
    ],
  },
]

export const SIMCTL_INVALID_CASES: IphoneSimctlInvalidCase[] = [
  { scenario: "recusa espaço Unicode fora de string", source: '{"devices":\u00a0{}}' },
  { scenario: "recusa número com separador interno", source: '{"devices":{},"x":1 2}' },
  { scenario: "recusa literal truncado", source: '{"devices":{},"x":nul}' },
  { scenario: "recusa array incompleto", source: '{"devices":{},"x":[1' },
  { scenario: "recusa objeto incompleto", source: '{"devices":{},"x":{"a":1' },
  { scenario: "recusa objeto sem dois pontos", source: '{"devices":{},"x":{"a" 1}}' },
  { scenario: "recusa comentário", source: '{"devices":{},"x":/*x*/0}' },
  { scenario: "recusa texto vazio", source: "" },
  { scenario: "recusa BOM", source: '\ufeff{"devices":{}}' },
  { scenario: "recusa lixo final", source: '{"devices":{}}x' },
  { scenario: "recusa segunda raiz", source: '{"devices":{}}{}' },
  { scenario: "recusa raiz array", source: "[]" },
  { scenario: "recusa devices ausente", source: "{}" },
  { scenario: "recusa devices array", source: '{"devices":[]}' },
  { scenario: "recusa devices null", source: '{"devices":null}' },
  { scenario: "recusa devices string", source: '{"devices":"x"}' },
  { scenario: "recusa devices válido seguido de inválido", source: '{"devices":{},"devices":0}' },
  { scenario: "recusa runtime válido seguido de inválido", source: '{"devices":{"r":[],"r":false}}' },
  { scenario: "recusa último grupo inválido", source: `{"devices":{"r":[${SIMCTL_DEVICE_JSON}],"s":[{}]}}` },
  { scenario: "recusa aparelho array", source: '{"devices":{"r":[[]]}}' },
  { scenario: "recusa aparelho sem state", source: '{"devices":{"r":[{"udid":"a","name":"iPhone"}]}}' },
  {
    scenario: "recusa campo válido seguido de inválido",
    source: '{"devices":{"r":[{"udid":"a","udid":null,"name":"iPhone","state":"Booted"}]}}',
  },
  { scenario: "recusa vírgula final raiz", source: '{"devices":{},}' },
  { scenario: "recusa vírgula final runtime", source: '{"devices":{"r":[],}}' },
  { scenario: "recusa vírgula final array", source: `{"devices":{"r":[${SIMCTL_DEVICE_JSON},]}}` },
  { scenario: "recusa escape inválido", source: String.raw`{"devices":{},"x":"\x"}` },
  { scenario: "recusa unicode curto", source: String.raw`{"devices":{},"x":"\u12"}` },
  { scenario: "recusa unicode não hexadecimal", source: String.raw`{"devices":{},"x":"\u12xz"}` },
  { scenario: "recusa controle cru", source: '{"devices":{},"x":"line\nline"}' },
  { scenario: "recusa string incompleta", source: '{"devices":{},"x":"' },
  { scenario: "recusa escape incompleto", source: '{"devices":{},"x":"\\' },
  { scenario: "recusa zero inicial", source: '{"devices":{},"x":01}' },
  { scenario: "recusa fração sem dígito", source: '{"devices":{},"x":1.}' },
  { scenario: "recusa expoente sem dígito", source: '{"devices":{},"x":1e}' },
  { scenario: "recusa sinal sem número", source: '{"devices":{},"x":-}' },
  { scenario: "recusa sinal positivo", source: '{"devices":{},"x":+1}' },
  { scenario: "recusa literal inválido", source: '{"devices":{},"x":True}' },
  { scenario: "recusa extra array malformado", source: '{"devices":{},"x":[{"a":[1,]}]}' },
  { scenario: "recusa extra objeto malformado", source: '{"devices":{},"x":{"a":{false}}}' },
  { scenario: "recusa extra sem separador", source: '{"devices":{},"x":[true false]}' },
  { scenario: "recusa sintaxe inválida mesmo sobrescrita", source: '{"devices":[01],"devices":{}}' },
  {
    scenario: "recusa extra malformado em runtime sobrescrito",
    source: `{"devices":{"r":[{"x":[1,]}],"r":[${SIMCTL_DEVICE_JSON}]}}`,
  },
]
