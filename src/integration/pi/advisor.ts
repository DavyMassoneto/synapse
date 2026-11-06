import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { Text } from "@earendil-works/pi-tui";
import type { createAdvisor } from "../../modules/advisor/public/index.ts";

type Advisor = ReturnType<typeof createAdvisor>;
export function registerAdvisor(pi: ExtensionAPI, advisor: Advisor) {
  let lastCtx: ExtensionContext | undefined;
  const lifetime = new AbortController();
  pi.on("session_shutdown", () => lifetime.abort());
  const sync = (ctx: ExtensionContext) => {
    const cfg = advisor.config.load();
    const active = pi.getActiveTools();
    if (cfg.model && !active.includes("advisor")) pi.setActiveTools([...active, "advisor"]);
    if (!cfg.model && active.includes("advisor")) pi.setActiveTools(active.filter(n => n !== "advisor"));
    if (ctx.hasUI) ctx.ui.setStatus("advisor", cfg.model ? "advisor: " + cfg.model : undefined);
  };
  pi.on("session_start", (_event, ctx) => { lastCtx = ctx; advisor.reset(); sync(ctx); });
  pi.on("before_agent_start", (event, ctx) => {
    lastCtx = ctx; sync(ctx);
    if (advisor.config.load().model) event.systemPromptOptions.sections.advisor = advisor.timing;
    else delete event.systemPromptOptions.sections.advisor;
  });
  pi.on("tool_result", event => { if (event.toolName === "advisor") advisor.reset(); });
  pi.on("turn_end", event => {
    const reminder = advisor.turn(event.outcome === "completed", event.toolResults.length > 0);
    if (reminder) return { entries: [...event.entries, { type: "custom_message", customType: "advisor-lembrete", content: reminder, display: false }] };
  });
  pi.registerTool({
    name: "advisor", label: "Advisor", executionMode: "sequential", parameters: Type.Object({}),
    description: "Consult a stronger advisor for strategic guidance. No parameters. The active conversation is sent to the configured provider, subject to context limits; images are omitted.",
    promptSnippet: "Consult a stronger advisor model with the conversation (no parameters)",
    renderCall(_args, theme, context) {
      const t = (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
      t.setText(theme.fg("toolTitle", theme.bold("advisor ")) + theme.fg("muted", advisor.config.load().model ?? ""));
      return t;
    },
    renderResult(result, { expanded, isPartial }, theme, context) {
      const t = (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
      if (isPartial) { t.setText(theme.fg("warning", "consultando...")); return t; }
      const body = result.content.map(c => c.type === "text" ? c.text : "").join(String.fromCharCode(10));
      if (context.isError) { t.setText(theme.fg("error", body)); return t; }
      const lines = body.split(String.fromCharCode(10)); const shown = expanded ? lines : lines.slice(0, 8);
      t.setText(theme.fg("success", "✓ conselho") + String.fromCharCode(10) + shown.join(String.fromCharCode(10)) + (!expanded && lines.length > shown.length ? String.fromCharCode(10) + theme.fg("dim", "... (" + (lines.length - shown.length) + " linhas a mais)") : ""));
      return t;
    },
    async execute(_id, _params, signal, onUpdate, ctx) {
      try {
        const cfg = advisor.config.load();
        if (!cfg.model) throw new Error("no advisor model configured");
        const slash = cfg.model.indexOf("/");
        const model = slash > 0 ? ctx.modelRegistry.find(cfg.model.slice(0, slash), cfg.model.slice(slash + 1)) : undefined;
        if (!model) throw new Error("advisor model not found: " + cfg.model);
        if (!ctx.modelRegistry.hasConfiguredAuth(model)) throw new Error("no credentials for " + cfg.model);
        onUpdate?.({ content: [{ type: "text", text: "Consulting " + cfg.model + "..." }], details: {} });
        let raw: any[];
        try { raw = ctx.sessionManager.buildSessionProjection().messages; }
        catch { raw = ctx.sessionManager.buildContextEntries().filter((e: any) => e.type === "message").map((e: any) => e.message); }
        const messages = raw.map(m => ({ role: m.role, content: typeof m.content === "string" ? m.content : Array.isArray(m.content) ? m.content.map((b: any) => b.type === "text" ? { type: "text", text: b.text } : b.type === "image" ? { type: "image" } : b.type === "toolCall" ? { type: "toolCall", name: b.name, arguments: JSON.parse(JSON.stringify(b.arguments ?? {})) } : { type: String(b.type) }) : undefined, toolName: m.toolName, isError: m.isError, command: m.command, output: m.output, excludeFromContext: m.excludeFromContext, customType: m.customType, summary: m.summary }));
        const callSignal = signal ? AbortSignal.any([signal, lifetime.signal]) : lifetime.signal;
        callSignal.throwIfAborted();
        const result = await advisor.consult({ config: cfg, system: ctx.getSystemPrompt(), messages, contextWindow: model.contextWindow ?? 200000, signal: callSignal }, async request => {
          const reply = await ctx.modelRegistry.streamSimple(model, { systemPrompt: request.system, messages: [{ role: "user", content: [{ type: "text", text: request.prompt }], timestamp: Date.now() }] }, { signal: request.signal, reasoning: request.thinking !== "off" && model.reasoning ? request.thinking as any : undefined }).result();
          if (reply.stopReason === "error" || reply.stopReason === "aborted") throw new Error(reply.errorMessage ?? reply.stopReason);
          const body = reply.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
          if (!body) throw new Error("advisor returned no text");
          return { text: body, usage: reply.usage };
        });
        return { content: [{ type: "text" as const, text: result.text }], details: { model: cfg.model }, usage: result.usage as any };
      } catch (e) { return { content: [{ type: "text" as const, text: "Advisor unavailable: " + String((e as Error).message) + ". Continue without advice." }], details: {}, isError: true }; }
    },
  });
  const modelRefs = (ctx: ExtensionContext) => (ctx.scopedModels?.length ? ctx.scopedModels.map(s => s.model) : ctx.modelRegistry.getAvailable()).map(m => m.provider + "/" + m.id);
  pi.registerCommand("advisor", {
    description: "Choose advisor model or thinking level",
    getArgumentCompletions: prefix => ["off", "thinking", ...(lastCtx ? modelRefs(lastCtx) : [])].filter(v => v.toLowerCase().startsWith(prefix.toLowerCase())).slice(0, 40).map(value => ({ value, label: value })),
    handler: async (args, ctx) => {
      lastCtx = ctx;
      const cfg = advisor.config.load(); const input = args.trim();
      const commit = (message: string) => { advisor.config.save(cfg); sync(ctx); ctx.ui.notify(message, "info"); };
      if (input === "off") { cfg.model = undefined; return commit("Advisor desligado"); }
      if (input.startsWith("thinking")) {
        const level = input.slice(8).trim();
        if (!(advisor.config.thinkingLevels as readonly string[]).includes(level)) return ctx.ui.notify("Níveis: " + advisor.config.thinkingLevels.join(", "), "error");
        cfg.thinking = level as typeof cfg.thinking; return commit("Advisor thinking: " + level);
      }
      const all = modelRefs(ctx); let chosen: string | undefined;
      if (input) {
        const terms = input.toLowerCase().split(/\s+/); const exact = all.find(r => r.toLowerCase() === input.toLowerCase());
        const hits = exact ? [exact] : all.filter(r => terms.every(t => r.toLowerCase().includes(t)));
        if (!hits.length) return ctx.ui.notify("Nenhum modelo casa com '" + input + "'", "error");
        chosen = hits.length === 1 ? hits[0] : ctx.hasUI ? await ctx.ui.select("Modelo advisor", hits.slice(0, 100)) : undefined;
      } else if (ctx.hasUI) {
        const pick = await ctx.ui.select("Modelo advisor", ["(sem advisor)", ...all]);
        if (pick === "(sem advisor)") { cfg.model = undefined; return commit("Advisor desligado"); }
        chosen = pick;
      } else return ctx.ui.notify("Advisor: " + (cfg.model ?? "desligado") + ", thinking " + cfg.thinking, "info");
      if (chosen) { cfg.model = chosen; commit("Advisor: " + chosen); }
    },
  });
}
