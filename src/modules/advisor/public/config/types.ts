import { type Static } from "typebox";
import { type thinkingSchema } from "@/modules/advisor/public/config";

export type ThinkingLevel = Static<typeof thinkingSchema>;
