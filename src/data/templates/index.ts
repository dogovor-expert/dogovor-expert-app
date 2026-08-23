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
import { TEMPLATES_RENTALS } from "./rentals";
import { TEMPLATES_SALES } from "./sales";
import { TEMPLATES_CONTRACTS } from "./contracts";
import { TEMPLATES_HR } from "./hr";
import { TEMPLATES_CLAIMS } from "./claims";
import { TEMPLATES_FINANCE_ACTS } from "./finance-act";
import { TEMPLATES_CORPORATE_WEB } from "./corporate-web";

export const LEGAL_TEMPLATES: LegalTemplate[] = [
  ...TEMPLATES_AUTO,
  ...TEMPLATES_FINANCE,
  ...TEMPLATES_REALTY,
  ...TEMPLATES_BUSINESS,
  ...TEMPLATES_RENTALS,
  ...TEMPLATES_SALES,
  ...TEMPLATES_CONTRACTS,
  ...TEMPLATES_HR,
  ...TEMPLATES_CLAIMS,
  ...TEMPLATES_FINANCE_ACTS,
  ...TEMPLATES_CORPORATE_WEB,
  ...TEMPLATES_FAMILY,
  ...TEMPLATES_OTHER,
  ...TEMPLATES_MIGRATION,
  ...TEMPLATES_LEGAL,
  ...TEMPLATES_POSTAL,
];
