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

export type TemplateId =
  | "classic"
  | "modern"
  | "minimal"
  | "executive"
  | "gradient"
  | "compact"
  | "fresher"
  | "timeline"
  | "twocol"
  | "academic"
  | "expert"
  | "creative"
  | "corporate"
  | "techpro"
  | "legal"
  | "nordic"
  | "sidebarpro"
  | "ocean"
  | "terracotta"
  | "graphite"
  | "forest"
  | "wine";

export type TemplateAts = "safe" | "creative";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  desc: string;
  ats: TemplateAts;
  parse: number;
  tags: string[];
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
