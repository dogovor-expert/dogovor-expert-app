import type { LegalTemplate } from "./types";

// Монолит разбит на src/data/templates/<category>.ts (см. scripts/split-templates.mjs).
export { LEGAL_TEMPLATES } from "./templates";
export type { LegalTemplate };
