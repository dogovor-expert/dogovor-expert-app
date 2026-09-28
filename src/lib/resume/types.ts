/** Типы данных конструктора резюме. */

export interface ResumePersonal {
  surname: string;
  name: string;
  patronymic: string;
  role: string;
  city: string;
  phone: string;
  email: string;
  link: string;
  photo: string;
  showPhoto?: boolean;
}

export interface ResumeExperience {
  company: string;
  position: string;
  period: string;
  bullets: string[];
}

export interface ResumeEducation {
  institution: string;
  field: string;
  degree: string;
  start: string;
  end: string;
}

export interface ResumeSkills {
  hard: string[];
  soft: string[];
  tools: string[];
}

export interface ResumeLanguage {
  name: string;
  level: string;
}

export interface ResumeData {
  personal: ResumePersonal;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkills;
  languages: ResumeLanguage[];
}

/** Идентификаторы шаблонов — как в эталонном макете РЕЗЮМЕ 3. */
export type TemplateId =
  | "executive-navy"
  | "tech-indigo"
  | "classic-legal"
  | "nordic-minimal"
  | "modern-emerald"
  | "creative-coral"
  | "junior-launch"
  | "corporate-slate"
  | "data-mono"
  | "legal-counsel";

export type TemplateAts = "safe" | "creative";

/** Раскладки шаблонов из макета РЕЗЮМЕ 3. */
export type TemplateLayout =
  | "executive-header"
  | "tech-split"
  | "classic-serif"
  | "clean-minimal"
  | "modern-sidebar"
  | "creative-accent";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  desc: string;
  ats: TemplateAts;
  parse: number;
  tags: string[];
  category: string;
  layout: TemplateLayout;
  color: string;
  badge?: string;
  downloads: string;
  rating: number;
  pages: number;
}

export interface ProfessionPreset {
  label: string;
  role: string;
  summary: string;
  hard: string[];
  soft: string[];
  tools: string[];
  langs: Array<[string, string]>;
}

export interface PhraseHint {
  b: string;
  g: string;
}
