import { describe, it, expect } from "vitest";
import { atLeast, parseAdminRole, ADMIN_ROLES, ROLE_LABELS } from "@/lib/admin-rbac";

describe("admin-rbac (6.5)", () => {
  it("parseAdminRole принимает только допустимые значения", () => {
    for (const r of ADMIN_ROLES) expect(parseAdminRole(r)).toBe(r);
    expect(parseAdminRole(null)).toBeNull();
    expect(parseAdminRole(undefined)).toBeNull();
    expect(parseAdminRole("")).toBeNull();
    expect(parseAdminRole("owner")).toBeNull();
    expect(parseAdminRole(42)).toBeNull();
  });

  it("иерархия superadmin > admin > moderator", () => {
    expect(atLeast("superadmin", "admin")).toBe(true);
    expect(atLeast("superadmin", "superadmin")).toBe(true);
    expect(atLeast("admin", "admin")).toBe(true);
    expect(atLeast("admin", "moderator")).toBe(true);
    expect(atLeast("admin", "superadmin")).toBe(false);
    expect(atLeast("moderator", "admin")).toBe(false);
    expect(atLeast("moderator", "moderator")).toBe(true);
  });

  it("null-роль не проходит ни один гейт", () => {
    expect(atLeast(null, "moderator")).toBe(false);
    expect(atLeast(null, "admin")).toBe(false);
    expect(atLeast(null, "superadmin")).toBe(false);
  });

  it("у каждой роли есть человекочитаемая метка", () => {
    for (const r of ADMIN_ROLES) expect(ROLE_LABELS[r].length).toBeGreaterThan(0);
  });
});
