"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerSynapse;
/** Arquivos em dist/ são gerados a partir de src/ pelo compilador TypeScript. Não edite a distribuição diretamente. */
const composition_1 = require("./composition");
const integration_1 = require("./integration");
function registerSynapse(pi) {
    const composition = (0, composition_1.compose)();
    (0, integration_1.registerAdvisor)(pi, composition.advisor, composition.signal, composition.shutdown);
}
