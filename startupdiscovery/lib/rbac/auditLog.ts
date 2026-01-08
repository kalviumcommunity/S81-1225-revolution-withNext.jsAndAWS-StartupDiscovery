/**
 * Audit Logging System for RBAC
 * Tracks all access control decisions for security and compliance
 */

import { UserRole, Action } from "./roles";

export type AuditAction = "ALLOWED" | "DENIED";

export interface AuditLog {
  timestamp: Date;
  userId: number | string;
  userEmail: string;
  userRole: UserRole;
  action: Action;
  resource: string; // What resource was being accessed
  resourceId?: string | number; // ID of the resource
  result: AuditAction;
  reason?: string; // Why was it denied
  ipAddress?: string;
  userAgent?: string;
}

// In-memory audit log (in production, save to database)
const auditLogs: AuditLog[] = [];

/**
 * Log an access control decision
 */
export function logAuditEvent(event: AuditLog): void {
  auditLogs.push({
    ...event,
    timestamp: new Date(),
  });

  // Log to console for visibility
  const status = event.result === "ALLOWED" ? "✓ ALLOWED" : "✗ DENIED";
  const icon = event.result === "ALLOWED" ? "✅" : "❌";
  const reason = event.reason ? ` (${event.reason})` : "";

  console.log(
    `${icon} [RBAC_AUDIT] ${event.userEmail} (${event.userRole}) → ${event.action} on ${event.resource}${event.resourceId ? `#${event.resourceId}` : ""}: ${status}${reason}`
  );
}

/**
 * Get audit logs (with optional filtering)
 */
export function getAuditLogs(
  filters?: Partial<{
    userId: number | string;
    action: Action;
    result: AuditAction;
    startDate: Date;
    endDate: Date;
  }>
): AuditLog[] {
  if (!filters) return auditLogs;

  return auditLogs.filter((log) => {
    if (filters.userId && log.userId !== filters.userId) return false;
    if (filters.action && log.action !== filters.action) return false;
    if (filters.result && log.result !== filters.result) return false;
    if (filters.startDate && log.timestamp < filters.startDate) return false;
    if (filters.endDate && log.timestamp > filters.endDate) return false;
    return true;
  });
}

/**
 * Get audit summary (statistics)
 */
export function getAuditSummary(): {
  totalEvents: number;
  allowedCount: number;
  deniedCount: number;
  allowedPercentage: number;
  topDeniedActions: Array<{ action: Action; count: number }>;
  topDeniedRoles: Array<{ role: UserRole; count: number }>;
} {
  const allowed = auditLogs.filter((log) => log.result === "ALLOWED").length;
  const denied = auditLogs.filter((log) => log.result === "DENIED").length;
  const total = auditLogs.length;

  // Get top denied actions
  const deniedByAction = auditLogs
    .filter((log) => log.result === "DENIED")
    .reduce(
      (acc, log) => {
        const existing = acc.find((item) => item.action === log.action);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ action: log.action, count: 1 });
        }
        return acc;
      },
      [] as Array<{ action: Action; count: number }>
    );

  // Get top denied roles
  const deniedByRole = auditLogs
    .filter((log) => log.result === "DENIED")
    .reduce(
      (acc, log) => {
        const existing = acc.find((item) => item.role === log.userRole);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ role: log.userRole, count: 1 });
        }
        return acc;
      },
      [] as Array<{ role: UserRole; count: number }>
    );

  return {
    totalEvents: total,
    allowedCount: allowed,
    deniedCount: denied,
    allowedPercentage: total > 0 ? (allowed / total) * 100 : 0,
    topDeniedActions: deniedByAction
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topDeniedRoles: deniedByRole.sort((a, b) => b.count - a.count).slice(0, 5),
  };
}

/**
 * Clear audit logs (for testing/reset)
 */
export function clearAuditLogs(): void {
  auditLogs.length = 0;
  console.log("[RBAC_AUDIT] Audit logs cleared");
}

/**
 * Export audit logs as JSON
 */
export function exportAuditLogs(): string {
  return JSON.stringify(getAuditLogs(), null, 2);
}

/**
 * Get high-risk activities (multiple denials from same user/role)
 */
export function getHighRiskActivities(denialThreshold = 3): Array<{
  subject: string;
  type: "user" | "role";
  denialCount: number;
  lastDenial: Date;
  attemptedActions: Action[];
}> {
  const userDenials: Record<
    string,
    { count: number; last: Date; actions: Action[] }
  > = {};
  const roleDenials: Record<
    string,
    { count: number; last: Date; actions: Action[] }
  > = {};

  auditLogs
    .filter((log) => log.result === "DENIED")
    .forEach((log) => {
      // Track by user
      if (!userDenials[log.userEmail]) {
        userDenials[log.userEmail] = {
          count: 0,
          last: log.timestamp,
          actions: [],
        };
      }
      userDenials[log.userEmail].count++;
      userDenials[log.userEmail].last = log.timestamp;
      if (!userDenials[log.userEmail].actions.includes(log.action)) {
        userDenials[log.userEmail].actions.push(log.action);
      }

      // Track by role
      if (!roleDenials[log.userRole]) {
        roleDenials[log.userRole] = {
          count: 0,
          last: log.timestamp,
          actions: [],
        };
      }
      roleDenials[log.userRole].count++;
      roleDenials[log.userRole].last = log.timestamp;
      if (!roleDenials[log.userRole].actions.includes(log.action)) {
        roleDenials[log.userRole].actions.push(log.action);
      }
    });

  const riskActivities: Array<{
    subject: string;
    type: "user" | "role";
    denialCount: number;
    lastDenial: Date;
    attemptedActions: Action[];
  }> = [];

  // Add high-risk users
  Object.entries(userDenials).forEach(([email, data]) => {
    if (data.count >= denialThreshold) {
      riskActivities.push({
        subject: email,
        type: "user",
        denialCount: data.count,
        lastDenial: data.last,
        attemptedActions: data.actions,
      });
    }
  });

  // Add high-risk roles
  Object.entries(roleDenials).forEach(([role, data]) => {
    if (data.count >= denialThreshold) {
      riskActivities.push({
        subject: role,
        type: "role",
        denialCount: data.count,
        lastDenial: data.last,
        attemptedActions: data.actions,
      });
    }
  });

  return riskActivities.sort((a, b) => b.denialCount - a.denialCount);
}
