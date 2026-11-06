/* ARQUIVO AUTOGERADO — NÃO EDITE DIRETAMENTE. Altere src/ e execute npm run build. */

// src/entry.ts
import { homedir } from "node:os";
import { join } from "node:path";

// src/modules/advisor/public/config/schema.ts
import { Type } from "typebox";
var thinkingSchema = Type.Union([
  Type.Literal("off"),
  Type.Literal("minimal"),
  Type.Literal("low"),
  Type.Literal("medium"),
  Type.Literal("high"),
  Type.Literal("xhigh"),
  Type.Literal("max")
]);

// src/modules/advisor/adapters/config.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Value } from "typebox/value";

// src/modules/advisor/adapters/schema/config-schema.ts
import { Type as Type2 } from "typebox";
var configSchema = Type2.Object({
  model: Type2.Optional(Type2.String()),
  thinking: Type2.Optional(thinkingSchema)
});

// src/modules/advisor/adapters/config.ts
var FileConfig = class {
  constructor(path) {
    this.path = path;
  }
  path;
  load() {
    let content;
    try {
      content = readFileSync(this.path, "utf8");
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return { kind: "missing" };
      }
      return { kind: "invalid", message: "N\xE3o foi poss\xEDvel ler a configura\xE7\xE3o do advisor." };
    }
    try {
      const config = Value.Parse(configSchema, JSON.parse(content));
      return {
        kind: "loaded",
        config: { model: config.model || void 0, thinking: config.thinking ?? "high" }
      };
    } catch {
      return { kind: "invalid", message: "Configura\xE7\xE3o do advisor inv\xE1lida; revise advisor.json." };
    }
  }
  save(config) {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, `${JSON.stringify(config, null, 2)}
`);
  }
};

// src/modules/advisor/internal/reminder/counter.ts
var REMIND_EVERY = 5;
var ReminderCounter = class {
  turns = 0;
  reset() {
    this.turns = 0;
  }
  advance(event) {
    if (!event.completed) {
      return false;
    }
    this.turns += 1;
    if (this.turns < REMIND_EVERY || !event.usedTools) {
      return false;
    }
    this.reset();
    return true;
  }
};

// src/modules/advisor/internal/format/instructions.ts
var TIMING = `You have access to an "advisor" tool backed by a stronger reviewer model. It takes NO parameters \u2014 when you call advisor(), your entire conversation history is automatically forwarded. They see the task, every tool call you've made, every result you've seen.

Call advisor BEFORE substantive work \u2014 before writing, before committing to an interpretation, before building on an assumption. If the task requires orientation first (finding files, fetching a source, seeing what's there), do that, then call advisor. Orientation is not substantive work. Writing, editing, and declaring an answer are.

Also call advisor:
- When you believe the task is complete. BEFORE this call, make your deliverable durable: write the file, save the result, commit the change. The advisor call takes time; if the session ends during it, a durable result persists and an unwritten one doesn't.
- When stuck \u2014 errors recurring, approach not converging, results that don't fit.
- When considering a change of approach.

On tasks longer than a few steps, call advisor at least once before committing to an approach and once before declaring done. On short reactive tasks where the next action is dictated by tool output you just read, you don't need to keep calling \u2014 the advisor adds most of its value on the first call, before the approach crystallizes.

Give the advice serious weight. If you follow a step and it fails empirically, or you have primary-source evidence that contradicts a specific claim (the file says X, the paper states Y), adapt. A passing self-test is not evidence the advice is wrong \u2014 it's evidence your test doesn't check what the advice is checking.

If you've already retrieved data pointing one way and the advisor points another: don't silently switch. Surface the conflict in one more advisor call \u2014 "I found X, you suggest Y, which constraint breaks the tie?" The advisor saw your evidence but may have underweighted it; a reconcile call is cheaper than committing to the wrong branch.`;
var REMINDER = "<system-reminder>\nJ\xE1 se passaram " + REMIND_EVERY + " turnos desde a \xFAltima consulta ao advisor. Pergunte-se agora:\n- Estou repetindo uma tentativa que j\xE1 falhou, ou os resultados n\xE3o batem com o que eu esperava?\n- Vou mudar de abordagem, ou acabei de concluir algo que ainda n\xE3o revisei?\n- O usu\xE1rio me corrigiu ou perguntou algo que eu n\xE3o sei responder com o que est\xE1 no hist\xF3rico?\nSe alguma resposta for sim, chame o advisor agora. Se a pr\xF3xima a\xE7\xE3o j\xE1 est\xE1 clara pelo \xFAltimo resultado, n\xE3o chame e siga.\n</system-reminder>";
var ADVISOR_SYSTEM = `You are the advisor: a stronger model that a faster executor model consults in the middle of a task.
You have no tools and cannot act. Below you get the executor's system prompt and its full transcript so far (user messages, the executor's text, every tool call and tool result), ending at the moment it called advisor(). Earlier advisor results appear in the transcript too.

Your job is to give strategic guidance the executor then acts on:
- Before substantive work: the approach to take, the decisions that matter, the pitfalls, and what to verify.
- When the executor is stuck or changing course: diagnose why, and say concretely what to do instead.
- When the executor believes it is done: review critically \u2014 missing requirements, bugs, unverified claims, edge cases, things left in a bad state \u2014 and say explicitly whether it is fine to finish.

Rules:
- Be specific and actionable; refer to the files, commands and results in the transcript. Order points by importance.
- Do not rewrite the whole solution, do not repeat the transcript, do not pad. If the executor is on track, say so in a line.
- Correct wrong assumptions even when the executor stated them confidently, and say what evidence would settle a doubt.
- Answer in the language the user is using.`;

// src/modules/advisor/internal/format/prompt.ts
var ESTIMATED_CHARACTERS_PER_TOKEN = 3;
var RESPONSE_RESERVE_CHARACTERS = 2048;
var MAX_SYSTEM_CHARACTERS = 4e4;
var PROMPT_PREFIX = "<executor_system_prompt>\n";
var TRANSCRIPT_PREFIX = "\n</executor_system_prompt>\n\n<transcript>\n";
var PROMPT_SUFFIX = "\n</transcript>\n\nThe executor just called advisor(). Give your guidance now.";
function preparePrompt(input, contextWindow) {
  const available = contextWindow * ESTIMATED_CHARACTERS_PER_TOKEN - ADVISOR_SYSTEM.length - RESPONSE_RESERVE_CHARACTERS;
  const fixedLength = PROMPT_PREFIX.length + TRANSCRIPT_PREFIX.length + PROMPT_SUFFIX.length;
  if (available <= fixedLength) {
    return void 0;
  }
  const systemLimit = Math.min(MAX_SYSTEM_CHARACTERS, Math.floor((available - fixedLength) / 2));
  const system = clip(input.system, systemLimit);
  const transcriptBudget = available - fixedLength - system.length;
  const transcript = buildTranscript(input.messages, transcriptBudget);
  return PROMPT_PREFIX + system + TRANSCRIPT_PREFIX + transcript + PROMPT_SUFFIX;
}

// src/modules/advisor/internal/format/transcript.ts
var TOOL_RESULT_LIMIT = 12e3;
var HEAD_FRACTION = 0.6;
var SEPARATOR = "\n\n";
function clip(text, limit) {
  if (limit <= 0) {
    return "";
  }
  if (text.length <= limit) {
    return text;
  }
  const marker = "\n[... conte\xFAdo omitido ...]\n";
  if (limit <= marker.length) {
    return text.slice(0, limit);
  }
  const available = limit - marker.length;
  const head = Math.floor(available * HEAD_FRACTION);
  const tail = available - head;
  return text.slice(0, head) + marker + text.slice(-tail);
}
function renderMessage(message, limit) {
  if (message.kind === "shell" && message.hidden) {
    return "";
  }
  let label = `[${message.kind}]`;
  if (message.kind === "toolResult") {
    label = `[tool_result ${message.name ?? ""}${message.error ? " (error)" : ""}]`;
  } else if (message.kind === "shell") {
    label = `[user ran shell] $ ${message.name ?? ""}`;
  } else if (message.kind === "custom") {
    label = `[context:${message.name ?? ""}]`;
  } else if (message.kind === "summary") {
    label = "[summary of earlier conversation]";
  }
  const parts = [label];
  for (const block of message.blocks) {
    if (block.kind === "image") {
      parts.push("[image omitted]");
    } else if (block.kind === "call") {
      parts.push(`[tool_call ${block.name}] ${clip(block.arguments, limit)}`);
    } else if (message.kind === "toolResult" || message.kind === "shell" || message.kind === "custom") {
      parts.push(clip(block.text, limit));
    } else {
      parts.push(block.text);
    }
  }
  return parts.join("\n");
}
function buildTranscript(messages, budget) {
  if (budget <= 0) {
    return "";
  }
  let blocks = [];
  for (const limit of [TOOL_RESULT_LIMIT, 4e3, 1500, 500]) {
    blocks = [];
    for (const message of messages) {
      const text = renderMessage(message, limit);
      if (text) {
        blocks.push(text);
      }
    }
    const full = blocks.join(SEPARATOR);
    if (full.length <= budget) {
      return full;
    }
  }
  const marker = "[... mensagens anteriores omitidas ...]";
  if (budget <= marker.length) {
    return clip(blocks[blocks.length - 1] ?? "", budget);
  }
  const selected = [];
  let remaining = budget - marker.length;
  for (let index = blocks.length - 1; index >= 0; index--) {
    const block = blocks[index];
    const available = remaining - SEPARATOR.length;
    if (available <= 0) {
      break;
    }
    if (block.length > available) {
      if (selected.length === 0) {
        const clipped = clip(block, available);
        selected.unshift(clipped);
        remaining -= clipped.length + SEPARATOR.length;
      }
      break;
    }
    selected.unshift(block);
    remaining -= block.length + SEPARATOR.length;
  }
  if (selected.length > 0 && blocks.length > selected.length) {
    const available = remaining - SEPARATOR.length;
    if (available > 0) {
      selected.unshift(clip(blocks[0], available));
    }
  }
  return [marker, ...selected].join(SEPARATOR);
}

// src/modules/advisor/internal/config/state.ts
import { Value as Value2 } from "typebox/value";
var AdvisorConfiguration = class {
  constructor(config) {
    this.config = config;
    const loaded = config.load();
    if (loaded.kind === "invalid") {
      this.current = { kind: "failure", message: loaded.message };
    } else if (loaded.kind === "loaded") {
      this.current = { kind: "success", status: loaded.config };
    } else {
      this.current = { kind: "success", status: { thinking: "high" } };
    }
  }
  config;
  current;
  status() {
    if (this.current.kind === "failure") {
      return { ...this.current };
    }
    return { kind: "success", status: { ...this.current.status } };
  }
  persist(status) {
    if (this.current.kind === "failure") {
      return this.status();
    }
    try {
      this.config.save(status);
      this.current = { kind: "success", status };
      return this.status();
    } catch {
      return { kind: "failure", message: "N\xE3o foi poss\xEDvel salvar a configura\xE7\xE3o do advisor." };
    }
  }
  selectModel(model) {
    const separator = model.indexOf("/");
    if (separator <= 0 || separator === model.length - 1) {
      return { kind: "failure", message: "O modelo deve usar o formato provedor/id." };
    }
    if (this.current.kind === "failure") {
      return this.status();
    }
    return this.persist({ model, thinking: this.current.status.thinking });
  }
  disable() {
    if (this.current.kind === "failure") {
      return this.status();
    }
    return this.persist({ thinking: this.current.status.thinking });
  }
  setThinking(thinking) {
    if (!Value2.Check(thinkingSchema, thinking)) {
      return { kind: "failure", message: "N\xEDvel de racioc\xEDnio inv\xE1lido." };
    }
    if (this.current.kind === "failure") {
      return this.status();
    }
    return this.persist({ model: this.current.status.model, thinking });
  }
};

// src/modules/advisor/internal/service.ts
var AdvisorService = class {
  timing = TIMING;
  configuration;
  reminder = new ReminderCounter();
  constructor(config) {
    this.configuration = new AdvisorConfiguration(config);
  }
  status() {
    return this.configuration.status();
  }
  selectModel(model) {
    return this.configuration.selectModel(model);
  }
  disable() {
    return this.configuration.disable();
  }
  setThinking(thinking) {
    return this.configuration.setThinking(thinking);
  }
  reset() {
    this.reminder.reset();
  }
  turn(event) {
    const status = this.configuration.status();
    if (status.kind === "failure" || !status.status.model) {
      return void 0;
    }
    if (this.reminder.advance(event)) {
      return REMINDER;
    }
    return void 0;
  }
  async consult(input, model) {
    if (input.signal?.aborted) {
      return { kind: "cancelled" };
    }
    const status = this.configuration.status();
    if (status.kind === "failure") {
      return status;
    }
    const configuration = status.status;
    if (!configuration.model) {
      return { kind: "failure", message: "no advisor model configured" };
    }
    try {
      const contextWindow = await model.contextWindow(configuration.model, input.signal);
      if (input.signal?.aborted) {
        return { kind: "cancelled" };
      }
      const prompt = preparePrompt(input, contextWindow);
      if (prompt === void 0) {
        return {
          kind: "failure",
          message: "A janela do advisor \xE9 pequena demais para a consulta."
        };
      }
      const response = await model.consult({
        system: ADVISOR_SYSTEM,
        prompt,
        model: configuration.model,
        thinking: configuration.thinking,
        signal: input.signal
      });
      if (input.signal?.aborted || response.kind === "cancelled") {
        return { kind: "cancelled" };
      }
      return { kind: "success", model: configuration.model, response };
    } catch (error) {
      if (input.signal?.aborted) {
        return { kind: "cancelled" };
      }
      const message = error instanceof Error ? error.message : String(error);
      return { kind: "failure", message };
    }
  }
};

// src/modules/advisor/public/create-advisor.ts
function createAdvisor(path) {
  return new AdvisorService(new FileConfig(path));
}

// src/modules/advisor/public/thinking.ts
var THINKING_LEVELS = thinkingSchema.anyOf.map(getThinkingValue);
function getThinkingValue(schema) {
  return schema.const;
}

// src/composition/compose.ts
function compose(host, configPath) {
  const lifetime = new AbortController();
  const advisor = createAdvisor(configPath);
  host.register(advisor, lifetime.signal, lifetime.abort.bind(lifetime));
}

// src/integration/pi/advisor/advisor.ts
function registerAdvisor(pi, advisor, signal, shutdown) {
  registerEvents(pi, advisor, shutdown);
  registerTool(pi, advisor, signal);
  registerCommand(pi, advisor);
}

// src/integration/pi/advisor/command.ts
var COMPLETION_LIMIT = 40;
var MODEL_SELECTION_LIMIT = 100;
var DISABLED_OPTION = "(sem advisor)";
var AdvisorCommand = class {
  constructor(pi, advisor) {
    this.pi = pi;
    this.advisor = advisor;
  }
  pi;
  advisor;
  models = [];
  start(_event, context) {
    this.models = this.modelRefs(context);
  }
  modelRefs(context) {
    const refs = [];
    if (context.scopedModels.length > 0) {
      for (const entry of context.scopedModels) {
        refs.push(`${entry.model.provider}/${entry.model.id}`);
      }
    } else {
      for (const model of context.modelRegistry.getAvailable()) {
        refs.push(`${model.provider}/${model.id}`);
      }
    }
    return refs;
  }
  completions(prefix) {
    const normalizedPrefix = prefix.toLowerCase();
    const items = [];
    for (const value of ["off", "thinking", ...this.models]) {
      if (value.toLowerCase().startsWith(normalizedPrefix)) {
        items.push({ value, label: value });
      }
      if (items.length === COMPLETION_LIMIT) {
        break;
      }
    }
    return items;
  }
  notifyStatus(context, status, message) {
    if (status.kind === "failure") {
      context.ui.notify(status.message, "error");
      return;
    }
    syncAdvisor(this.pi, this.advisor, context);
    context.ui.notify(message, "info");
  }
  changeThinking(context, requested) {
    for (const level of THINKING_LEVELS) {
      if (level === requested) {
        const status = this.advisor.setThinking(level);
        this.notifyStatus(context, status, `Advisor thinking: ${level}`);
        return;
      }
    }
    context.ui.notify(`N\xEDveis: ${THINKING_LEVELS.join(", ")}`, "error");
  }
  matchModels(models, input) {
    const search = input.toLowerCase();
    const terms = search.split(/\s+/);
    const matches = [];
    for (const model of models) {
      const normalizedModel = model.toLowerCase();
      if (normalizedModel === search) {
        return [model];
      }
      let matchesAll = true;
      for (const term of terms) {
        if (!normalizedModel.includes(term)) {
          matchesAll = false;
          break;
        }
      }
      if (matchesAll) {
        matches.push(model);
      }
    }
    return matches;
  }
  async chooseModel(context, models, input) {
    if (!input) {
      return context.ui.select("Modelo advisor", [DISABLED_OPTION, ...models]);
    }
    const matches = this.matchModels(models, input);
    if (matches.length === 0) {
      context.ui.notify(`Nenhum modelo encontrado: ${input}`, "error");
      return void 0;
    }
    if (matches.length === 1) {
      return matches[0];
    }
    if (context.hasUI) {
      return context.ui.select("Modelo advisor", matches.slice(0, MODEL_SELECTION_LIMIT));
    }
    context.ui.notify(
      "Mais de um modelo corresponde; informe uma refer\xEAncia mais espec\xEDfica.",
      "warning"
    );
    return void 0;
  }
  async handle(args, context) {
    this.models = this.modelRefs(context);
    const status = this.advisor.status();
    const input = args.trim();
    if (status.kind === "failure") {
      context.ui.notify(status.message, "error");
      return;
    }
    if (input === "off") {
      this.notifyStatus(context, this.advisor.disable(), "Advisor desligado");
      return;
    }
    const [command, ...argumentsList] = input.split(/\s+/);
    if (command === "thinking") {
      this.changeThinking(context, argumentsList.join(" "));
      return;
    }
    if (!input && !context.hasUI) {
      context.ui.notify(
        `Advisor: ${status.status.model ?? "desligado"}, thinking ${status.status.thinking}`,
        "info"
      );
      return;
    }
    const chosen = await this.chooseModel(context, this.modelRefs(context), input);
    if (chosen === DISABLED_OPTION) {
      this.notifyStatus(context, this.advisor.disable(), "Advisor desligado");
    } else if (chosen) {
      this.notifyStatus(context, this.advisor.selectModel(chosen), `Advisor: ${chosen}`);
    }
  }
};
function registerCommand(pi, advisor) {
  const command = new AdvisorCommand(pi, advisor);
  pi.on("session_start", command.start.bind(command));
  pi.registerCommand("advisor", {
    description: "Escolhe o modelo advisor ou o n\xEDvel de racioc\xEDnio",
    getArgumentCompletions: command.completions.bind(command),
    handler: command.handle.bind(command)
  });
}

// src/integration/pi/advisor/events.ts
function syncAdvisor(pi, advisor, context) {
  const result = advisor.status();
  const model = result.kind === "success" ? result.status.model : void 0;
  const active = pi.getActiveTools();
  if (model && !active.includes("advisor")) {
    pi.setActiveTools([...active, "advisor"]);
  } else if (!model && active.includes("advisor")) {
    const remaining = [];
    for (const name of active) {
      if (name !== "advisor") {
        remaining.push(name);
      }
    }
    pi.setActiveTools(remaining);
  }
  if (context.hasUI) {
    context.ui.setStatus("advisor", model ? `advisor: ${model}` : void 0);
  }
}
var AdvisorEvents = class {
  constructor(pi, advisor, shutdownCallback) {
    this.pi = pi;
    this.advisor = advisor;
    this.shutdownCallback = shutdownCallback;
  }
  pi;
  advisor;
  shutdownCallback;
  start(_event, context) {
    this.advisor.reset();
    syncAdvisor(this.pi, this.advisor, context);
    const status = this.advisor.status();
    if (status.kind === "failure" && context.hasUI) {
      context.ui.notify(status.message, "error");
    }
  }
  shutdown() {
    this.shutdownCallback();
  }
  beforeStart(event, context) {
    syncAdvisor(this.pi, this.advisor, context);
    const result = this.advisor.status();
    if (result.kind === "success" && result.status.model) {
      event.systemPromptOptions.sections.advisor = this.advisor.timing;
    } else {
      delete event.systemPromptOptions.sections.advisor;
    }
  }
  toolResult(event) {
    if (event.toolName === "advisor") {
      this.advisor.reset();
    }
  }
  turnEnd(event) {
    const reminder = this.advisor.turn({
      completed: event.outcome === "completed",
      usedTools: event.toolResults.length > 0
    });
    if (!reminder) {
      return void 0;
    }
    return {
      entries: [
        ...event.entries,
        {
          type: "custom_message",
          customType: "advisor-lembrete",
          content: reminder,
          display: false
        }
      ]
    };
  }
};
function registerEvents(pi, advisor, shutdownCallback) {
  const handlers = new AdvisorEvents(pi, advisor, shutdownCallback);
  pi.on("session_start", handlers.start.bind(handlers));
  pi.on("session_shutdown", handlers.shutdown.bind(handlers));
  pi.on("before_agent_start", handlers.beforeStart.bind(handlers));
  pi.on("tool_result", handlers.toolResult.bind(handlers));
  pi.on("turn_end", handlers.turnEnd.bind(handlers));
}

// src/integration/pi/advisor/model.ts
var AdvisorModel = class {
  constructor(context) {
    this.context = context;
  }
  context;
  model;
  async contextWindow(reference, signal) {
    signal?.throwIfAborted();
    const separator = reference.indexOf("/");
    if (separator <= 0 || separator === reference.length - 1) {
      throw new Error("invalid advisor model reference");
    }
    const provider = reference.slice(0, separator);
    const modelId = reference.slice(separator + 1);
    const model = this.context.modelRegistry.find(provider, modelId);
    if (!model) {
      throw new Error(`advisor model not found: ${reference}`);
    }
    if (!this.context.modelRegistry.hasConfiguredAuth(model)) {
      throw new Error(`no credentials for ${reference}`);
    }
    this.model = model;
    return model.contextWindow;
  }
  async consult(request) {
    const model = this.model;
    if (!model) {
      throw new Error("advisor model not resolved");
    }
    const reasoning = request.thinking !== "off" && model.reasoning ? request.thinking : void 0;
    const reply = await this.context.modelRegistry.streamSimple(
      model,
      {
        systemPrompt: request.system,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: request.prompt }],
            timestamp: Date.now()
          }
        ]
      },
      { signal: request.signal, reasoning }
    ).result();
    if (reply.stopReason === "aborted") {
      return { kind: "cancelled" };
    }
    if (reply.stopReason === "error") {
      throw new Error(reply.errorMessage ?? reply.stopReason);
    }
    const parts = [];
    for (const block of reply.content) {
      if (block.type === "text") {
        parts.push(block.text);
      }
    }
    const text = parts.join("\n").trim();
    if (!text) {
      throw new Error("advisor returned no text");
    }
    const usage = reply.usage;
    return {
      kind: "success",
      text,
      usage: {
        input: usage.input,
        output: usage.output,
        cacheRead: usage.cacheRead,
        cacheWrite: usage.cacheWrite,
        totalTokens: usage.totalTokens,
        cost: {
          input: usage.cost.input,
          output: usage.cost.output,
          cacheRead: usage.cost.cacheRead,
          cacheWrite: usage.cost.cacheWrite,
          total: usage.cost.total
        }
      }
    };
  }
};

// src/integration/pi/advisor/rendering.ts
import { Text } from "@earendil-works/pi-tui";
var AdvisorRendering = class {
  renderCall(_input, theme, context) {
    let text;
    if (context.lastComponent instanceof Text) {
      text = context.lastComponent;
    } else {
      text = new Text("", 0, 0);
    }
    text.setText(theme.fg(RENDER_STYLE.title, theme.bold(RENDER_TEXT.title)));
    return text;
  }
  renderResult(result, options, theme, context) {
    let text;
    if (context.lastComponent instanceof Text) {
      text = context.lastComponent;
    } else {
      text = new Text("", 0, 0);
    }
    if (options.isPartial) {
      text.setText(theme.fg(RENDER_STYLE.pending, RENDER_TEXT.pending));
      return text;
    }
    const content = [];
    for (const block of result.content) {
      if (block.type === "text") {
        content.push(block.text);
      }
    }
    const body = content.join("\n");
    if (context.isError) {
      text.setText(theme.fg(RENDER_STYLE.error, body));
      return text;
    }
    const lines = body.split("\n");
    let shown = lines;
    if (!options.expanded) {
      shown = lines.slice(0, PREVIEW_LINES);
    }
    const remaining = lines.length - shown.length;
    let suffix = "";
    if (!options.expanded && remaining > 0) {
      suffix = `
${theme.fg(RENDER_STYLE.additional, `... (${remaining} linhas a mais)`)}`;
    }
    const model = result.details?.model;
    const title = model ? `${RENDER_TEXT.success} (${model})` : RENDER_TEXT.success;
    text.setText(`${theme.fg(RENDER_STYLE.success, title)}
${shown.join("\n")}${suffix}`);
    return text;
  }
};
function createRenderers() {
  const rendering = new AdvisorRendering();
  return {
    renderCall: rendering.renderCall.bind(rendering),
    renderResult: rendering.renderResult.bind(rendering)
  };
}

// src/integration/pi/advisor/rendering-constants.ts
var PREVIEW_LINES = 8;
var RENDER_TEXT = {
  pending: "consultando...",
  success: "\u2713 conselho",
  title: "advisor "
};
var RENDER_STYLE = {
  title: "toolTitle",
  pending: "warning",
  error: "error",
  success: "success",
  muted: "muted",
  additional: "dim"
};

// src/integration/pi/advisor/tool.ts
var AdvisorToolHandler = class {
  constructor(advisor, lifetime) {
    this.advisor = advisor;
    this.lifetime = lifetime;
  }
  advisor;
  lifetime;
  async execute(_id, _params, signal, onUpdate, context) {
    const callSignal = signal ? AbortSignal.any([signal, this.lifetime]) : this.lifetime;
    if (callSignal.aborted) {
      return {
        content: [{ type: "text", text: "Consulta ao advisor cancelada." }],
        details: {},
        isError: true
      };
    }
    try {
      onUpdate?.({ content: [{ type: "text", text: "Consultando advisor..." }], details: {} });
      const advisorModel = new AdvisorModel(context);
      const result = await this.advisor.consult(
        {
          system: context.getSystemPrompt(),
          messages: captureTranscript(context),
          signal: callSignal
        },
        advisorModel
      );
      if (result.kind === "cancelled") {
        return {
          content: [{ type: "text", text: "Consulta ao advisor cancelada." }],
          details: {},
          isError: true
        };
      }
      if (result.kind === "failure") {
        return { content: [{ type: "text", text: result.message }], details: {}, isError: true };
      }
      return {
        content: [{ type: "text", text: result.response.text }],
        details: { model: result.model },
        usage: result.response.usage
      };
    } catch (error) {
      if (callSignal.aborted) {
        return {
          content: [{ type: "text", text: "Consulta ao advisor cancelada." }],
          details: {},
          isError: true
        };
      }
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Advisor unavailable: ${message}. Continue without advice.`
          }
        ],
        details: {},
        isError: true
      };
    }
  }
};
function registerTool(pi, advisor, lifetime) {
  const handler = new AdvisorToolHandler(advisor, lifetime);
  pi.registerTool({
    name: "advisor",
    label: "Advisor",
    executionMode: "sequential",
    parameters: advisorParameters,
    description: "Consult a stronger advisor for strategic guidance. No parameters. The active conversation is sent to the configured provider, subject to context limits; images are omitted.",
    promptSnippet: "Consult a stronger advisor model with the conversation (no parameters)",
    ...createRenderers(),
    execute: handler.execute.bind(handler)
  });
}

// src/integration/pi/advisor/tool-schema.ts
import { Type as Type3 } from "typebox";
var advisorParameters = Type3.Object({});

// src/integration/pi/advisor/transcript.ts
function convertContent(content) {
  if (typeof content === "string") {
    return [{ kind: "text", text: content }];
  }
  const blocks = [];
  for (const block of content) {
    if (block.type === "text") {
      blocks.push({ kind: "text", text: block.text });
    } else {
      blocks.push({ kind: "image" });
    }
  }
  return blocks;
}
function convertMessage(message) {
  switch (message.role) {
    case "user":
      return { kind: "user", blocks: convertContent(message.content) };
    case "assistant": {
      const blocks = [];
      for (const block of message.content) {
        if (block.type === "text") {
          blocks.push({ kind: "text", text: block.text });
        } else if (block.type === "toolCall") {
          blocks.push({
            kind: "call",
            name: block.name,
            arguments: JSON.stringify(block.arguments)
          });
        }
      }
      return { kind: "assistant", blocks };
    }
    case "toolResult":
      return {
        kind: "toolResult",
        name: message.toolName,
        error: message.isError,
        blocks: convertContent(message.content)
      };
    case "bashExecution":
      return {
        kind: "shell",
        name: message.command,
        hidden: message.excludeFromContext,
        blocks: [{ kind: "text", text: message.output }]
      };
    case "custom":
      return { kind: "custom", name: message.customType, blocks: convertContent(message.content) };
    case "branchSummary":
    case "compactionSummary":
      return { kind: "summary", blocks: [{ kind: "text", text: message.summary }] };
    default:
      return void 0;
  }
}
function captureTranscript(context) {
  const messages = context.sessionManager.buildSessionProjection().messages;
  const transcript = [];
  for (const message of messages) {
    const converted = convertMessage(message);
    if (converted !== void 0) {
      transcript.push(converted);
    }
  }
  return transcript;
}

// src/integration/pi/extension.ts
var PiHost = class {
  constructor(pi) {
    this.pi = pi;
  }
  pi;
  register(advisor, signal, shutdown) {
    registerAdvisor(this.pi, advisor, signal, shutdown);
  }
};

// src/entry.ts
function registerSynapse(pi) {
  compose(new PiHost(pi), join(homedir(), ".pi", "agent", "advisor.json"));
}
export {
  registerSynapse as default
};
