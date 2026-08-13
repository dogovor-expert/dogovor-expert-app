export interface TemplateFieldOption {
  label: string;
  value: string;
}

export interface TemplateFieldDependency {
  fieldId: string;
  value?: string;
  values?: string[];
}

export interface TemplateField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "radio" | "checkbox" | "textarea" | "repeating";
  placeholder?: string;
  defaultValue: string;
  category:
    | "seller"
    | "buyer"
    | "vehicle"
    | "contract"
    | "other"
    | "sts"
    | "pts"
    | "grz"
    | "owner"
    | "representative"
    | "insurance"
    | "payment"
    | "items"
    | "realty"
    | "business"
    | "family"
    | "landlord"
    | "tenant"
    | "driver"
    | "object"
    | "recipient"
    | "sender"
    | "lender"
    | "borrower"
    | "executor"
    | "customer"
    | "contractor"
    | "spouse"
    | "applicant"
    | "invoice"
    | "employer"
    | "employee"
    | "donor"
    | "donee"
    | "agent"
    | "principal"
    | "guarantor"
    | "court"
    | "testator"
    | "heir"
    | "property"
    | "notary"
    | "payer"
    | "child"
    | "spouse1"
    | "spouse2";
  options?: TemplateFieldOption[] | string[];
  rows?: number;
  dependsOn?: TemplateFieldDependency;
  validation?: {
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    helpText?: string;
  };
  repeatingFields?: {
    id: string;
    label: string;
    type: "text" | "number";
    defaultValue?: string;
    width?: string;
  }[];
}

export interface TemplateVersion {
  id: string;
  label: string;
  previewTemplate: string;
}

export interface LegalTemplate {
  id: string;
  name: string;
  category: "auto" | "realty" | "business" | "finance" | "migration" | "postal" | "other" | "family" | "legal";
  actSource: string;
  lastUpdated: string;
  description: string;
  fields: TemplateField[];
  previewTemplate: string;
  suggestedDocs: string[];
  supportsOcr?: boolean;
  versions?: TemplateVersion[];
  printInstruction?: string;
}
