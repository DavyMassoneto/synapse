import { REMIND_EVERY } from "@/modules/advisor/internal/reminder";

export const REMINDER =
  "<system-reminder>\n" +
  "Já se passaram " +
  REMIND_EVERY +
  " turnos desde a última consulta ao advisor. Pergunte-se agora:\n" +
  "- Estou repetindo uma tentativa que já falhou, ou os resultados não batem com o que eu esperava?\n" +
  "- Vou mudar de abordagem, ou acabei de concluir algo que ainda não revisei?\n" +
  "- O usuário me corrigiu ou perguntou algo que eu não sei responder com o que está no histórico?\n" +
  "Se alguma resposta for sim, chame o advisor agora. Se a próxima ação já está clara pelo último resultado, não chame e siga.\n" +
  "</system-reminder>";
