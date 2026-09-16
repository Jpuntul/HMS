// Real role strings from Employee.role (see PRODUCT.md) mapped to a
// compact badge abbreviation and a role color from the design tokens.
// Abbreviation only - never a fabricated clinical role beyond what the
// record itself says. Same mapping as pages/dashboard/Dashboard.tsx uses,
// kept here so every Employee-entity surface renders roles identically.
export const ROLE_META: Record<string, { abbr: string; color: string }> = {
  nurse: { abbr: "RN", color: "var(--color-role-nurse)" },
  doctor: { abbr: "MD", color: "var(--color-role-doctor)" },
  pharmacist: { abbr: "RPH", color: "var(--color-role-pharmacist)" },
  receptionist: { abbr: "REC", color: "var(--color-role-security)" },
  "administrative personnel": {
    abbr: "ADM",
    color: "var(--color-role-admin)",
  },
  "security personnel": { abbr: "SEC", color: "var(--color-role-security)" },
  cashier: { abbr: "CSH", color: "var(--color-role-cashier)" },
  "regular employee": { abbr: "EMP", color: "var(--color-role-regular)" },
};

export function roleMeta(role: string): { abbr: string; color: string } {
  return (
    ROLE_META[role.toLowerCase()] ?? {
      abbr: role.slice(0, 3).toUpperCase(),
      color: "var(--color-role-regular)",
    }
  );
}
