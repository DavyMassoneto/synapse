#!/usr/bin/env node

// CLI client for the Synapse unity-bridge (protocol v2).
// Reads run/handshake.json (or --handshake path) and talks flat-JSON over TCP loopback.
//
// Usage:
//   node client.mjs ping
//   node client.mjs state
//   node client.mjs tree [--max 60] [--max-texts 200] [--no-texts] [--offscreen]
//   node client.mjs hit 117 385
//   node client.mjs click 117 385
//   node client.mjs click --label "Caixa de entrada"
//   node client.mjs click --id 3f2a1b7c-0a1d --generation 17
//   node client.mjs scroll 900 500 --dy -3
//   node client.mjs scroll 900 500 --direction down --amount 2
//   node client.mjs scroll --label "Calendario" --dy -3
//   node client.mjs drag 100 300 100 180 [--steps 8]
//   node client.mjs text "abc" [--x 400 --y 250] [--submit] [--append]
//   node client.mjs key Return|Escape|Tab|Up|Down|Left|Right
//   node client.mjs stop
//   node client.mjs raw '{"op":"ping"}'
//   node client.mjs --handshake run/handshake-v2.json ping
//
// Exit codes: 0 ok, 2 usage/refused/error, 3 timeout (outcome unknown), 4 transport error.

import fs from "node:fs"
import net from "node:net"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = process.env.SYNAPSE_BRIDGE_DIR || path.resolve(here, "..")
let handshakePath = process.env.SYNAPSE_BRIDGE_HANDSHAKE || path.join(root, "run", "handshake.json")

function fail(message, code) {
  console.error(message)
  process.exit(code)
}

function readHandshake() {
  if (!fs.existsSync(handshakePath)) fail(`handshake ausente: ${handshakePath} (a bridge esta carregada?)`, 4)
  let parsed
  try {
    parsed = JSON.parse(fs.readFileSync(handshakePath, "utf8"))
  } catch (error) {
    fail(`handshake ilegivel (${error.message}); tente de novo`, 4)
  }
  if (!parsed.token || !parsed.port) fail("handshake sem token/port", 4)
  if (parsed.state === "stopped") fail("bridge parada segundo o handshake", 4)
  return parsed
}

function requestOnce(handshake, payload, timeoutMs) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: "127.0.0.1", port: handshake.port })
    let buffer = ""
    let settled = false
    const finish = (callback, value) => {
      if (settled) return
      settled = true
      socket.destroy()
      callback(value)
    }
    socket.setEncoding("utf8")
    socket.setTimeout(timeoutMs, () => finish(reject, new Error("client-timeout")))
    socket.on("connect", () => socket.write(JSON.stringify(payload) + "\n"))
    socket.on("data", (chunk) => {
      buffer += chunk
      const newline = buffer.indexOf("\n")
      if (newline >= 0) finish(resolve, buffer.slice(0, newline))
    })
    socket.on("error", (error) => finish(reject, error))
    socket.on("close", () => {
      if (!settled) finish(reject, new Error("connection-closed sem resposta"))
    })
  })
}

async function request(handshake, payload, timeoutMs = 8000) {
  try {
    return await requestOnce(handshake, payload, timeoutMs)
  } catch (error) {
    // Handshake pode estar defasado por alguns ms durante (re)start; uma unica retentativa de leitura,
    // nunca de acao: para 'click'/'stop' o erro de transporte e propagado como esta.
    if (["ping", "state", "tree", "hit"].includes(payload.op)) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const fresh = readHandshake()
      return await requestOnce(fresh, payload, timeoutMs)
    }
    throw error
  }
}

function flag(argv, name) {
  return argv.includes(name)
}

function option(argv, name) {
  const index = argv.indexOf(name)
  return index >= 0 ? argv[index + 1] : undefined
}

function number(value, label) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) fail(`${label} deve ser numerico`, 2)
  return parsed
}

function parseTree(response) {
  const parsed = JSON.parse(response)
  const withClient = (item) => ({
    ...item,
    client: {
      x: item.client_x,
      y: item.client_y,
      w: item.client_w,
      h: item.client_h,
      cx: item.cx ?? Math.round(item.client_x + item.client_w / 2),
      cy: item.cy ?? Math.round(item.client_y + item.client_h / 2),
    },
  })
  if (parsed.items) parsed.items = parsed.items.map(withClient)
  if (parsed.texts) parsed.texts = parsed.texts.map(withClient)
  return parsed
}

async function main() {
  const rawArgs = process.argv.slice(2)
  const handshakeIndex = rawArgs.indexOf("--handshake")
  if (handshakeIndex >= 0) {
    const value = rawArgs[handshakeIndex + 1]
    if (!value) fail("--handshake exige caminho", 2)
    handshakePath = path.resolve(value)
    rawArgs.splice(handshakeIndex, 2)
  }
  const argv = rawArgs
  if (argv.length === 0)
    fail("uso: node client.mjs [--handshake path] ping|state|tree|hit|click|scroll|drag|text|key|stop|raw ...", 2)
  const command = argv[0]
  const handshake = readHandshake()
  const base = { token: handshake.token }
  let payload
  let renderer = (raw) => raw

  if (command === "ping") payload = { ...base, op: "ping" }
  else if (command === "state") payload = { ...base, op: "state" }
  else if (command === "stop") payload = { ...base, op: "stop" }
  else if (command === "tree") {
    payload = {
      ...base,
      op: "tree",
      max: option(argv, "--max") !== undefined ? number(option(argv, "--max"), "--max") : 400,
      max_texts: option(argv, "--max-texts") !== undefined ? number(option(argv, "--max-texts"), "--max-texts") : 300,
      include_offscreen: flag(argv, "--offscreen"),
      include_texts: !flag(argv, "--no-texts"),
    }
    renderer = (raw) => JSON.stringify(parseTree(raw), null, 2)
  } else if (command === "hit") {
    payload = { ...base, op: "hit", x: number(argv[1], "x"), y: number(argv[2], "y") }
  } else if (command === "click") {
    const id = option(argv, "--id")
    const label = option(argv, "--label")
    if (id) {
      if (option(argv, "--generation") === undefined) fail("click --id exige --generation", 2)
      payload = {
        ...base,
        op: "click",
        id,
        generation: number(option(argv, "--generation"), "--generation"),
        hover: !flag(argv, "--no-hover"),
      }
    } else if (label) {
      payload = { ...base, op: "click", label, hover: !flag(argv, "--no-hover") }
    } else {
      payload = {
        ...base,
        op: "click",
        x: number(argv[1], "x"),
        y: number(argv[2], "y"),
        hover: !flag(argv, "--no-hover"),
      }
    }
  } else if (command === "scroll") {
    payload = { ...base, op: "scroll" }
    if (option(argv, "--label") !== undefined) payload.label = option(argv, "--label")
    if (option(argv, "--id") !== undefined) {
      payload.id = option(argv, "--id")
      if (option(argv, "--generation") === undefined) fail("scroll --id exige --generation", 2)
      payload.generation = number(option(argv, "--generation"), "--generation")
    }
    if (option(argv, "--direction") !== undefined) {
      payload.direction = option(argv, "--direction")
      payload.amount = option(argv, "--amount") !== undefined ? number(option(argv, "--amount"), "--amount") : 1
    } else {
      if (option(argv, "--dx") !== undefined) payload.dx = number(option(argv, "--dx"), "--dx")
      if (option(argv, "--dy") !== undefined) payload.dy = number(option(argv, "--dy"), "--dy")
      if (payload.dx === undefined && payload.dy === undefined)
        fail("scroll exige --dx/--dy ou --direction/--amount", 2)
    }
    if (option(argv, "--label") === undefined && option(argv, "--id") === undefined) {
      payload.x = number(argv[1], "x")
      payload.y = number(argv[2], "y")
    }
  } else if (command === "drag") {
    payload = {
      ...base,
      op: "drag",
      from_x: number(argv[1], "from_x"),
      from_y: number(argv[2], "from_y"),
      to_x: number(argv[3], "to_x"),
      to_y: number(argv[4], "to_y"),
      steps: option(argv, "--steps") !== undefined ? number(option(argv, "--steps"), "--steps") : 8,
    }
  } else if (command === "text") {
    if (argv[1] === undefined) fail('text exige o conteudo, ex: text "abc"', 2)
    payload = { ...base, op: "text", text: argv[1], submit: flag(argv, "--submit"), replace: !flag(argv, "--append") }
    if (option(argv, "--x") !== undefined && option(argv, "--y") !== undefined) {
      payload.x = number(option(argv, "--x"), "--x")
      payload.y = number(option(argv, "--y"), "--y")
    }
  } else if (command === "key") {
    if (!argv[1]) fail("key exige Return|Escape|Tab|Up|Down|Left|Right", 2)
    payload = { ...base, op: "key", key: argv[1] }
  } else if (command === "raw") {
    const json = argv[1]
    if (!json) fail("raw exige um JSON", 2)
    payload = { ...JSON.parse(json), token: JSON.parse(json).token ?? handshake.token }
    if (!payload.op) fail("raw exige op", 2)
  } else fail(`comando desconhecido: ${command}`, 2)

  let response
  try {
    response = await request(handshake, payload)
  } catch (error) {
    const timeout = error.message === "client-timeout"
    console.log(
      JSON.stringify(
        { status: timeout ? "outcome-unknown" : "transport-error", reason: error.message, op: payload.op },
        null,
        2,
      ),
    )
    process.exit(timeout ? 3 : 4)
  }

  let parsed
  try {
    parsed = renderer(response)
  } catch {
    parsed = response
  }
  console.log(typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2))

  try {
    const body = JSON.parse(response)
    if (body.status === "refused" || body.status === "error") process.exit(2)
    if (body.status === "outcome-unknown") process.exit(3)
  } catch {
    process.exit(2)
  }
}

main()
