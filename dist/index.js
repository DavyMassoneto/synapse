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
  thinking: Type.Optional(
    Type.Union([
      Type.Literal("off"),
      Type.Literal("minimal"),
      Type.Literal("low"),
      Type.Literal("medium"),
      Type.Literal("high"),
      Type.Literal("xhigh"),
      Type.Literal("max")
    ])
  )
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
function createService(config) {
  let turns = 0;
  return {
    config,
    timing: TIMING,
    reset() {
      turns = 0;
    },
    turn(completed, hasTools) {
      if (!completed || !config.load().model) {
        return void 0;
      }
      turns += 1;
      if (turns < 5 || !hasTools) {
        return void 0;
      }
      turns = 0;
      return REMINDER;
    },
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
}

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
    blocks = messages.map(
      (message) => message.parts.map((part) => part.clip ? clip(part.text, limit) : part.text).join("\n")
    );
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
  return createService({ load: loadConfig, save: saveConfig });
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
function modelRefs(context) {
  let models = context.modelRegistry.getAvailable();
  if (context.scopedModels.length > 0) {
    models = context.scopedModels.map((entry) => entry.model);
  }
  return models.map((model) => `${model.provider}/${model.id}`);
}
function registerCommand(pi, advisor) {
  let lastContext;
  pi.on("session_start", (_event, context) => {
    lastContext = context;
  });
  pi.registerCommand("advisor", {
    description: "Escolhe o modelo advisor ou o n\xEDvel de racioc\xEDnio",
    getArgumentCompletions(prefix) {
      const models = lastContext ? modelRefs(lastContext) : [];
      return ["off", "thinking", ...models].filter((value) => value.toLowerCase().startsWith(prefix.toLowerCase())).slice(0, 40).map((value) => ({ value, label: value }));
    },
    async handler(args, context) {
      lastContext = context;
      const config = advisor.config.load();
      const input = args.trim();
      const commit = (message) => {
        advisor.config.save(config);
        syncAdvisor(pi, advisor, context);
        context.ui.notify(message, "info");
      };
      if (input === "off") {
        config.model = void 0;
        commit("Advisor desligado");
        return;
      }
      if (input.startsWith("thinking")) {
        const requestedLevel = input.slice(8).trim();
        const level = THINKING_LEVELS.find((candidate) => candidate === requestedLevel);
        if (level === void 0) {
          context.ui.notify(`N\xEDveis: ${THINKING_LEVELS.join(", ")}`, "error");
          return;
        }
        config.thinking = level;
        commit(`Advisor thinking: ${level}`);
        return;
      }
      const models = modelRefs(context);
      let chosen;
      if (input) {
        const terms = input.toLowerCase().split(/\s+/);
        const exact = models.find((model) => model.toLowerCase() === input.toLowerCase());
        let matches = models.filter(
          (model) => terms.every((term) => model.toLowerCase().includes(term))
        );
        if (exact) {
          matches = [exact];
        }
        if (matches.length === 0) {
          context.ui.notify(`Nenhum modelo casa com '${input}'`, "error");
          return;
        }
        if (matches.length === 1) {
          chosen = matches[0];
        } else if (context.hasUI) {
          chosen = await context.ui.select("Modelo advisor", matches.slice(0, 100));
        }
      } else if (context.hasUI) {
        chosen = await context.ui.select("Modelo advisor", ["(sem advisor)", ...models]);
        if (chosen === "(sem advisor)") {
          config.model = void 0;
          commit("Advisor desligado");
          return;
        }
      } else {
        context.ui.notify(
          `Advisor: ${config.model ?? "desligado"}, thinking ${config.thinking}`,
          "info"
        );
        return;
      }
      if (chosen) {
        config.model = chosen;
        commit(`Advisor: ${chosen}`);
      }
    }
  });
}

// src/integration/pi/events.ts
function syncAdvisor(pi, advisor, context) {
  const model = advisor.config.load().model;
  const active = pi.getActiveTools();
  if (model && !active.includes("advisor")) {
    pi.setActiveTools([...active, "advisor"]);
  } else if (!model && active.includes("advisor")) {
    pi.setActiveTools(active.filter((name) => name !== "advisor"));
  }
  if (context.hasUI) {
    context.ui.setStatus("advisor", model ? `advisor: ${model}` : void 0);
  }
}
function registerEvents(pi, advisor, lifetime) {
  pi.on("session_start", (_event, context) => {
    advisor.reset();
    syncAdvisor(pi, advisor, context);
  });
  pi.on("session_shutdown", () => lifetime.abort());
  pi.on("before_agent_start", (event, context) => {
    syncAdvisor(pi, advisor, context);
    if (advisor.config.load().model) {
      event.systemPromptOptions.sections.advisor = advisor.timing;
    } else {
      delete event.systemPromptOptions.sections.advisor;
    }
  });
  pi.on("tool_result", (event) => {
    if (event.toolName === "advisor") {
      advisor.reset();
    }
  });
  pi.on("turn_end", (event) => {
    const reminder = advisor.turn(event.outcome === "completed", event.toolResults.length > 0);
    if (reminder) {
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
  });
}

// src/integration/pi/rendering.ts
import { Text } from "@earendil-works/pi-tui";
function createRenderers(advisor) {
  return {
    renderCall(_args, theme, context) {
      const text = context.lastComponent instanceof Text ? context.lastComponent : new Text("", 0, 0);
      text.setText(
        theme.fg("toolTitle", theme.bold("advisor ")) + theme.fg("muted", advisor.config.load().model ?? "")
      );
      return text;
    },
    renderResult(result, options, theme, context) {
      const text = context.lastComponent instanceof Text ? context.lastComponent : new Text("", 0, 0);
      if (options.isPartial) {
        text.setText(theme.fg("warning", "consultando..."));
        return text;
      }
      const body = result.content.map((block) => block.type === "text" ? block.text : "").join("\n");
      if (context.isError) {
        text.setText(theme.fg("error", body));
        return text;
      }
      const lines = body.split("\n");
      const shown = options.expanded ? lines : lines.slice(0, 8);
      const remaining = lines.length - shown.length;
      const suffix = !options.expanded && remaining > 0 ? `
${theme.fg("dim", `... (${remaining} linhas a mais)`)}` : "";
      text.setText(`${theme.fg("success", "\u2713 conselho")}
${shown.join("\n")}${suffix}`);
      return text;
    }
  };
}

// src/integration/pi/tool.ts
function registerTool(pi, advisor, lifetime) {
  pi.registerTool({
    name: "advisor",
    label: "Advisor",
    executionMode: "sequential",
    parameters: advisorParameters,
    description: "Consult a stronger advisor for strategic guidance. No parameters. The active conversation is sent to the configured provider, subject to context limits; images are omitted.",
    promptSnippet: "Consult a stronger advisor model with the conversation (no parameters)",
    ...createRenderers(advisor),
    async execute(_id, _params, signal, onUpdate, context) {
      try {
        const config = advisor.config.load();
        if (!config.model) {
          throw new Error("no advisor model configured");
        }
        const slash = config.model.indexOf("/");
        const model = slash > 0 ? context.modelRegistry.find(
          config.model.slice(0, slash),
          config.model.slice(slash + 1)
        ) : void 0;
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
        const callSignal = signal ? AbortSignal.any([signal, lifetime.signal]) : lifetime.signal;
        callSignal.throwIfAborted();
        const result = await advisor.consult(
          {
            config,
            system: context.getSystemPrompt(),
            messages: captureTranscript(context),
            contextWindow: model.contextWindow,
            signal: callSignal
          },
          async (request) => {
            const reasoning = request.thinking !== "off" && model.reasoning ? request.thinking : void 0;
            const reply = await context.modelRegistry.streamSimple(
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
            if (reply.stopReason === "error" || reply.stopReason === "aborted") {
              throw new Error(reply.errorMessage ?? reply.stopReason);
            }
            const text = reply.content.filter((block) => block.type === "text").map((block) => block.text).join("\n").trim();
            if (!text) {
              throw new Error("advisor returned no text");
            }
            return { text, usage: reply.usage };
          }
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
  return content.map((block) => block.type === "text" ? block.text : "[image omitted]").join("\n");
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
      const parts = message.content.flatMap((block) => {
        if (block.type === "text") {
          return [{ text: block.text, clip: false }];
        }
        if (block.type === "toolCall") {
          return [
            {
              text: `[tool_call ${block.name}] ${JSON.stringify(block.arguments)}`,
              clip: true
            }
          ];
        }
        return [];
      });
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
    messages = context.sessionManager.buildContextEntries().filter((entry) => entry.type === "message").map((entry) => entry.message);
  }
  return messages.map(convertMessage).filter((message) => message !== void 0);
}

// src/integration/pi/extension.ts
function registerSynapse(pi) {
  registerAdvisor(pi, compose());
}
export {
  registerSynapse as default
};
