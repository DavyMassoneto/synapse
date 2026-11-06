/* ARQUIVO AUTOGERADO — NÃO EDITE DIRETAMENTE. Altere src/ e execute npm run build. */

// src/modules/advisor/adapters/config.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { Value } from "typebox/value";
var CONFIG_PATH = join(homedir(), ".pi", "agent", "advisor.json");
var DEFAULT_MODEL = "omniroute/cc/claude-opus-5-5";
function loadConfig() {
  try {
    const config = Value.Parse(configSchema, JSON.parse(readFileSync(CONFIG_PATH, "utf8")));
    return { model: config.model || void 0, thinking: config.thinking ?? "high" };
  } catch {
    return { model: DEFAULT_MODEL, thinking: "high" };
  }
}
function saveConfig(config) {
  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}
`);
}

// src/modules/advisor/adapters/config-schema.ts
import { Type } from "typebox";
var configSchema = Type.Object({
  model: Type.Optional(Type.String()),
  thinking: Type.Optional(Type.Enum(THINKING_LEVELS))
});

// src/modules/advisor/internal/instructions.ts
var REMIND_EVERY = 5;
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

// src/modules/advisor/internal/service.ts
var AdvisorService = class {
  constructor(config) {
    this.config = config;
  }
  config;
  timing = TIMING;
  turns = 0;
  reset() {
    this.turns = 0;
  }
  turn(completed, hasTools) {
    if (!completed || !this.config.load().model) {
      return void 0;
    }
    this.turns += 1;
    if (this.turns < 5 || !hasTools) {
      return void 0;
    }
    this.turns = 0;
    return REMINDER;
  }
  async consult(input, model) {
    if (!input.config.model) {
      throw new Error("no advisor model configured");
    }
    const system = clip(input.system, 4e4);
    const budget = Math.max(2e4, (input.contextWindow - 26e3) * 3 - system.length);
    const transcript = buildTranscript(input.messages, budget);
    const prompt = [
      "<executor_system_prompt>",
      system,
      "</executor_system_prompt>",
      "",
      "<transcript>",
      transcript,
      "</transcript>",
      "",
      "The executor just called advisor(). Give your guidance now."
    ].join("\n");
    return model({
      system: ADVISOR_SYSTEM,
      prompt,
      model: input.config.model,
      thinking: input.config.thinking,
      signal: input.signal
    });
  }
};

// src/modules/advisor/internal/transcript.ts
var TOOL_RESULT_LIMIT = 12e3;
function clip(text, limit) {
  if (text.length <= limit) {
    return text;
  }
  const head = Math.floor(limit * 0.6);
  const omitted = text.length - limit;
  return text.slice(0, head) + "\n[... " + omitted + " chars omitted ...]\n" + text.slice(-(limit - head));
}
function buildTranscript(messages, budget) {
  let blocks = [];
  for (const limit of [TOOL_RESULT_LIMIT, 4e3, 1500, 500]) {
    blocks = [];
    for (const message of messages) {
      const parts = [];
      for (const part of message.parts) {
        parts.push(part.clip ? clip(part.text, limit) : part.text);
      }
      blocks.push(parts.join("\n"));
    }
    if (blocks.join("\n\n").length <= budget) {
      return blocks.join("\n\n");
    }
  }
  const first = blocks[0] ?? "";
  const tail = [];
  let used = first.length + 200;
  for (let index = blocks.length - 1; index > 0; index--) {
    if (used + blocks[index].length + 2 > budget) {
      break;
    }
    tail.unshift(blocks[index]);
    used += blocks[index].length + 2;
  }
  const omitted = blocks.length - 1 - tail.length;
  return [
    first,
    `[... ${omitted} earlier messages omitted to fit the advisor context window ...]`,
    ...tail
  ].join("\n\n");
}

// src/modules/advisor/public/create-advisor.ts
function createAdvisor() {
  return new AdvisorService({ load: loadConfig, save: saveConfig });
}

// src/modules/advisor/public/thinking.ts
var THINKING_LEVELS = [
  "off",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
];

// src/composition/compose.ts
function compose() {
  return createAdvisor();
}

// src/integration/pi/advisor.ts
function registerAdvisor(pi, advisor) {
  const lifetime = new AbortController();
  registerEvents(pi, advisor, lifetime);
  registerTool(pi, advisor, lifetime);
  registerCommand(pi, advisor);
}

// src/integration/pi/command.ts
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
  lastContext;
  start(_event, context) {
    this.lastContext = context;
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
    const models = this.lastContext ? this.modelRefs(this.lastContext) : [];
    const normalizedPrefix = prefix.toLowerCase();
    const items = [];
    for (const value of ["off", "thinking", ...models]) {
      if (value.toLowerCase().startsWith(normalizedPrefix)) {
        items.push({ value, label: value });
      }
      if (items.length === COMPLETION_LIMIT) {
        break;
      }
    }
    return items;
  }
  commit(context, config, message) {
    this.advisor.config.save(config);
    syncAdvisor(this.pi, this.advisor, context);
    context.ui.notify(message, "info");
  }
  changeThinking(context, config, requested) {
    for (const level of THINKING_LEVELS) {
      if (level === requested) {
        config.thinking = level;
        this.commit(context, config, `Advisor thinking: ${level}`);
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
    return void 0;
  }
  async handle(args, context) {
    this.lastContext = context;
    const config = this.advisor.config.load();
    const input = args.trim();
    if (input === "off") {
      config.model = void 0;
      this.commit(context, config, "Advisor desligado");
      return;
    }
    if (input.startsWith("thinking")) {
      this.changeThinking(context, config, input.slice(8).trim());
      return;
    }
    if (!input && !context.hasUI) {
      context.ui.notify(
        `Advisor: ${config.model ?? "desligado"}, thinking ${config.thinking}`,
        "info"
      );
      return;
    }
    const chosen = await this.chooseModel(context, this.modelRefs(context), input);
    if (chosen === DISABLED_OPTION) {
      config.model = void 0;
      this.commit(context, config, "Advisor desligado");
    } else if (chosen) {
      config.model = chosen;
      this.commit(context, config, `Advisor: ${chosen}`);
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

// src/integration/pi/events.ts
function syncAdvisor(pi, advisor, context) {
  const model = advisor.config.load().model;
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
  constructor(pi, advisor, lifetime) {
    this.pi = pi;
    this.advisor = advisor;
    this.lifetime = lifetime;
  }
  pi;
  advisor;
  lifetime;
  start(_event, context) {
    this.advisor.reset();
    syncAdvisor(this.pi, this.advisor, context);
  }
  shutdown() {
    this.lifetime.abort();
  }
  beforeStart(event, context) {
    syncAdvisor(this.pi, this.advisor, context);
    if (this.advisor.config.load().model) {
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
    const reminder = this.advisor.turn(event.outcome === "completed", event.toolResults.length > 0);
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
function registerEvents(pi, advisor, lifetime) {
  const handlers = new AdvisorEvents(pi, advisor, lifetime);
  pi.on("session_start", handlers.start.bind(handlers));
  pi.on("session_shutdown", handlers.shutdown.bind(handlers));
  pi.on("before_agent_start", handlers.beforeStart.bind(handlers));
  pi.on("tool_result", handlers.toolResult.bind(handlers));
  pi.on("turn_end", handlers.turnEnd.bind(handlers));
}

// src/integration/pi/model.ts
var AdvisorModel = class {
  constructor(context, model) {
    this.context = context;
    this.model = model;
  }
  context;
  model;
  async consult(request) {
    const reasoning = request.thinking !== "off" && this.model.reasoning ? request.thinking : void 0;
    const reply = await this.context.modelRegistry.streamSimple(
      this.model,
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
    if (reply.stopReason === "error" || reply.stopReason === "aborted") {
      throw new Error(reply.errorMessage ?? reply.stopReason);
    }
    let text = "";
    for (const block of reply.content) {
      if (block.type === "text") {
        text += `${block.text}
`;
      }
    }
    text = text.trim();
    if (!text) {
      throw new Error("advisor returned no text");
    }
    return { text, usage: reply.usage };
  }
};

// src/integration/pi/rendering.ts
import { Text } from "@earendil-works/pi-tui";
var AdvisorRendering = class {
  constructor(advisor) {
    this.advisor = advisor;
  }
  advisor;
  renderCall(_input, theme, context) {
    let text;
    if (context.lastComponent instanceof Text) {
      text = context.lastComponent;
    } else {
      text = new Text("", 0, 0);
    }
    text.setText(
      theme.fg("toolTitle", theme.bold("advisor ")) + theme.fg("muted", this.advisor.config.load().model ?? "")
    );
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
      text.setText(theme.fg("warning", "consultando..."));
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
      text.setText(theme.fg("error", body));
      return text;
    }
    const lines = body.split("\n");
    let shown = lines;
    if (!options.expanded) {
      shown = lines.slice(0, 8);
    }
    const remaining = lines.length - shown.length;
    let suffix = "";
    if (!options.expanded && remaining > 0) {
      suffix = `
${theme.fg("dim", `... (${remaining} linhas a mais)`)}`;
    }
    text.setText(`${theme.fg("success", "\u2713 conselho")}
${shown.join("\n")}${suffix}`);
    return text;
  }
};
function createRenderers(advisor) {
  const rendering = new AdvisorRendering(advisor);
  return {
    renderCall: rendering.renderCall.bind(rendering),
    renderResult: rendering.renderResult.bind(rendering)
  };
}

// src/integration/pi/tool.ts
var AdvisorToolHandler = class {
  constructor(advisor, lifetime) {
    this.advisor = advisor;
    this.lifetime = lifetime;
  }
  advisor;
  lifetime;
  async execute(_id, _params, signal, onUpdate, context) {
    try {
      const config = this.advisor.config.load();
      if (!config.model) {
        throw new Error("no advisor model configured");
      }
      const slash = config.model.indexOf("/");
      if (slash <= 0 || slash === config.model.length - 1) {
        throw new Error(`invalid advisor model: ${config.model}`);
      }
      const provider = config.model.slice(0, slash);
      const modelId = config.model.slice(slash + 1);
      const model = context.modelRegistry.find(provider, modelId);
      if (!model) {
        throw new Error(`advisor model not found: ${config.model}`);
      }
      if (!context.modelRegistry.hasConfiguredAuth(model)) {
        throw new Error(`no credentials for ${config.model}`);
      }
      onUpdate?.({
        content: [{ type: "text", text: `Consulting ${config.model}...` }],
        details: {}
      });
      const callSignal = signal ? AbortSignal.any([signal, this.lifetime.signal]) : this.lifetime.signal;
      callSignal.throwIfAborted();
      const advisorModel = new AdvisorModel(context, model);
      const result = await this.advisor.consult(
        {
          config,
          system: context.getSystemPrompt(),
          messages: captureTranscript(context),
          contextWindow: model.contextWindow,
          signal: callSignal
        },
        advisorModel.consult.bind(advisorModel)
      );
      return {
        content: [{ type: "text", text: result.text }],
        details: { model: config.model },
        usage: result.usage
      };
    } catch (error) {
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
    ...createRenderers(advisor),
    execute: handler.execute.bind(handler)
  });
}

// src/integration/pi/tool-schema.ts
import { Type as Type2 } from "typebox";
var advisorParameters = Type2.Object({});

// src/integration/pi/transcript.ts
function renderContent(content) {
  if (typeof content === "string") {
    return content;
  }
  const parts = [];
  for (const block of content) {
    parts.push(block.type === "text" ? block.text : "[image omitted]");
  }
  return parts.join("\n");
}
function convertMessage(message) {
  switch (message.role) {
    case "user":
      return {
        role: message.role,
        parts: [{ text: `[user]
${renderContent(message.content)}`, clip: false }]
      };
    case "assistant": {
      const parts = [];
      for (const block of message.content) {
        if (block.type === "text") {
          parts.push({ text: block.text, clip: false });
        } else if (block.type === "toolCall") {
          parts.push({
            text: `[tool_call ${block.name}] ${JSON.stringify(block.arguments)}`,
            clip: true
          });
        }
      }
      return { role: message.role, parts: [{ text: "[assistant]", clip: false }, ...parts] };
    }
    case "toolResult":
      return {
        role: message.role,
        parts: [
          {
            text: "[tool_result " + message.toolName + (message.isError ? " (error)" : "") + "]\n" + renderContent(message.content),
            clip: true
          }
        ]
      };
    case "bashExecution":
      if (message.excludeFromContext) {
        return void 0;
      }
      return {
        role: message.role,
        parts: [{ text: `[user ran shell] $ ${message.command}
${message.output}`, clip: true }]
      };
    case "custom":
      return {
        role: message.role,
        parts: [
          {
            text: `[context:${message.customType}]
${renderContent(message.content)}`,
            clip: true
          }
        ]
      };
    case "branchSummary":
    case "compactionSummary":
      return {
        role: message.role,
        parts: [{ text: `[summary of earlier conversation]
${message.summary}`, clip: false }]
      };
    default:
      return void 0;
  }
}
function captureTranscript(context) {
  let messages;
  try {
    messages = context.sessionManager.buildSessionProjection().messages;
  } catch {
    messages = [];
    for (const entry of context.sessionManager.buildContextEntries()) {
      if (entry.type === "message") {
        messages.push(entry.message);
      }
    }
  }
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
function registerSynapse(pi) {
  registerAdvisor(pi, compose());
}
export {
  registerSynapse as default
};
