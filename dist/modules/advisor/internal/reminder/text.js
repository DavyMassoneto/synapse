"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REMINDER = void 0;
const constants_1 = require("./constants");
exports.REMINDER = `<system-reminder>
Já se passaram ${constants_1.REMIND_EVERY} turnos desde a última consulta ao advisor. Pergunte-se agora:
- Estou repetindo uma tentativa que já falhou, ou os resultados não batem com o que eu esperava?
- Vou mudar de abordagem, ou acabei de concluir algo que ainda não revisei?
- O usuário me corrigiu ou perguntou algo que eu não sei responder com o que está no histórico?
Se alguma resposta for sim, chame o advisor agora. Se a próxima ação já está clara pelo último resultado, não chame e siga.
</system-reminder>`;
