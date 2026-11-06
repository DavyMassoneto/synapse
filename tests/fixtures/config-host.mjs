import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const manifest = JSON.parse(readFileSync("package.json", "utf8"));
const entrypoint = pathToFileURL(resolve(manifest.pi.extensions[0])).href;
const { default: register } = await import(entrypoint);

let command;
let tool;
let modelLookups = 0;
const notifications = [];

const host = {
  on() {},
  registerTool(definition) {
    tool = definition;
  },
  registerCommand(_name, definition) {
    command = definition;
  },
  getActiveTools() {
    return [];
  },
  setActiveTools() {},
};

const context = {
  hasUI: false,
  scopedModels: [],
  getSystemPrompt() {
    return "";
  },
  sessionManager: {
    buildSessionProjection() {
      return { messages: [] };
    },
  },
  modelRegistry: {
    getAvailable() {
      return [];
    },
    find() {
      modelLookups += 1;
      return undefined;
    },
  },
  ui: {
    notify(message) {
      notifications.push(message);
    },
    setStatus() {},
  },
};

register(host);
await command.handler("", context);
const result = await tool.execute("id", {}, undefined, undefined, context);
process.stdout.write(JSON.stringify({ notifications, result, modelLookups }));
