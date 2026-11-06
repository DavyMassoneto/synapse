import { createAdvisor } from "../modules/advisor/public/index.ts";
export function compose() { return { advisor: createAdvisor() }; }
