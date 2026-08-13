import type { LegalTemplate } from "../types";

import { TEMPLATES_AUTO } from "./auto";
import { TEMPLATES_FINANCE } from "./finance";
import { TEMPLATES_REALTY } from "./realty";
import { TEMPLATES_BUSINESS } from "./business";
import { TEMPLATES_FAMILY } from "./family";
import { TEMPLATES_OTHER } from "./other";
import { TEMPLATES_MIGRATION } from "./migration";
import { TEMPLATES_LEGAL } from "./legal";
import { TEMPLATES_POSTAL } from "./postal";

export const LEGAL_TEMPLATES: LegalTemplate[] = [
  ...TEMPLATES_AUTO,
  ...TEMPLATES_FINANCE,
  ...TEMPLATES_REALTY,
  ...TEMPLATES_BUSINESS,
  ...TEMPLATES_FAMILY,
  ...TEMPLATES_OTHER,
  ...TEMPLATES_MIGRATION,
  ...TEMPLATES_LEGAL,
  ...TEMPLATES_POSTAL,
];
