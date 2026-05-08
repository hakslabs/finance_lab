/**
 * Admin audit log helper.
 *
 * Under temporary M0 auth there is no `admin_audit_log` table yet — the
 * `recordAdminAction()` call resolves to a structured server-side log line
 * tagged `local-only`. Production deployments will replace this with an
 * insert against a dedicated `admin_audit_log` table.
 */

import "server-only";

export interface AdminAuditEntry {
  readonly actor: string;
  readonly action: string;
  readonly target?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface RecordedAdminAction extends AdminAuditEntry {
  readonly recordedAt: string;
  readonly mode: "local-only" | "persisted";
}

export function recordAdminAction(entry: AdminAuditEntry): RecordedAdminAction {
  const recorded: RecordedAdminAction = {
    ...entry,
    recordedAt: new Date().toISOString(),
    mode: "local-only",
  };

  // eslint-disable-next-line no-console
  console.info("[admin-audit]", JSON.stringify(recorded));
  return recorded;
}
