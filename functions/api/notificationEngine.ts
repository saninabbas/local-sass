/**
 * RANKORA 2.0 : ENTERPRISE NOTIFICATION & EVENT ENGINE
 * 
 * Manages real-time alerts, tenant-scoped notification dispatching,
 * unread state calculation, and event trigger handling.
 */

export type NotificationType = 
  | 'ranking' 
  | 'review' 
  | 'audit' 
  | 'authority' 
  | 'execution' 
  | 'connection' 
  | 'billing' 
  | 'system';

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface NotificationPayload {
  userId: string;
  businessId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  severity?: NotificationSeverity;
  actionUrl?: string | null;
  metadata?: Record<string, any> | null;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  business_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  read: boolean;
  action_url: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

let isNotificationSchemaEnsured = false;

/**
 * Defensive schema migration for notifications table & indexes
 */
export async function ensureNotificationTable(db: any): Promise<void> {
  if (isNotificationSchemaEnsured || !db) return;

  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        business_id TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'info',
        read INTEGER NOT NULL DEFAULT 0,
        action_url TEXT,
        metadata_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `).run().catch(() => {});

    await db.prepare("CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC)").run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read)").run().catch(() => {});
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_notifications_business ON notifications(business_id)").run().catch(() => {});

    isNotificationSchemaEnsured = true;
  } catch (e) {
    console.warn("Notification schema auto-init note:", e);
  }
}

const generateId = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;

/**
 * Creates a real notification in the database with strict tenant scoping
 */
export async function createNotification(
  db: any, 
  payload: NotificationPayload
): Promise<string | null> {
  if (!db || !payload.userId || !payload.title || !payload.message) {
    return null;
  }

  try {
    await ensureNotificationTable(db);

    const notifId = generateId('notif');
    const severity = payload.severity || 'info';
    const metadataJson = payload.metadata ? JSON.stringify(payload.metadata) : null;
    const actionUrl = payload.actionUrl || null;
    const businessId = payload.businessId || null;

    // Insert new notification
    await db.prepare(`
      INSERT INTO notifications (
        id, user_id, business_id, type, title, message, severity, read, action_url, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      notifId,
      payload.userId,
      businessId,
      payload.type,
      payload.title,
      payload.message,
      severity,
      actionUrl,
      metadataJson
    ).run();

    // Retention policy: Keep the most recent 100 notifications per user to prevent unbounded growth
    try {
      await db.prepare(`
        DELETE FROM notifications 
        WHERE user_id = ? 
          AND id NOT IN (
            SELECT id FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 100
          )
      `).bind(payload.userId, payload.userId).run().catch(() => {});
    } catch {
      // Non-blocking cleanup
    }

    return notifId;
  } catch (err) {
    console.error("Failed to create notification:", err);
    return null;
  }
}

/**
 * Retrieves notifications for an authenticated user with unread count
 */
export async function getNotificationsForUser(
  db: any,
  userId: string,
  businessId?: string | null,
  limit = 30
): Promise<{ notifications: NotificationRecord[]; unreadCount: number }> {
  if (!db || !userId) {
    return { notifications: [], unreadCount: 0 };
  }

  try {
    await ensureNotificationTable(db);

    // 1. Get unread count across user's notifications (or business-scoped if provided)
    let unreadCountRes;
    if (businessId && businessId.trim()) {
      unreadCountRes = await db.prepare(
        "SELECT COUNT(id) as cnt FROM notifications WHERE user_id = ? AND (business_id = ? OR business_id IS NULL) AND read = 0"
      ).bind(userId, businessId.trim()).first().catch(() => null);
    } else {
      unreadCountRes = await db.prepare(
        "SELECT COUNT(id) as cnt FROM notifications WHERE user_id = ? AND read = 0"
      ).bind(userId).first().catch(() => null);
    }

    const unreadCount = (unreadCountRes as any)?.cnt ? Number((unreadCountRes as any).cnt) : 0;

    // 2. Fetch recent notifications
    let queryResult;
    if (businessId && businessId.trim()) {
      queryResult = await db.prepare(`
        SELECT id, user_id, business_id, type, title, message, severity, read, action_url, metadata_json, created_at
        FROM notifications
        WHERE user_id = ? AND (business_id = ? OR business_id IS NULL)
        ORDER BY created_at DESC
        LIMIT ?
      `).bind(userId, businessId.trim(), Math.min(Math.max(limit, 1), 100)).all().catch(() => ({ results: [] }));
    } else {
      queryResult = await db.prepare(`
        SELECT id, user_id, business_id, type, title, message, severity, read, action_url, metadata_json, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `).bind(userId, Math.min(Math.max(limit, 1), 100)).all().catch(() => ({ results: [] }));
    }

    const rawRecords = (queryResult?.results || []) as any[];

    const notifications: NotificationRecord[] = rawRecords.map(r => {
      let parsedMeta = null;
      if (r.metadata_json) {
        try {
          parsedMeta = JSON.parse(r.metadata_json);
        } catch {}
      }

      return {
        id: r.id,
        user_id: r.user_id,
        business_id: r.business_id || null,
        type: (r.type as NotificationType) || 'system',
        title: r.title,
        message: r.message,
        severity: (r.severity as NotificationSeverity) || 'info',
        read: Boolean(r.read === 1 || r.read === true),
        action_url: r.action_url || null,
        metadata: parsedMeta,
        created_at: r.created_at || new Date().toISOString()
      };
    });

    return {
      notifications,
      unreadCount
    };
  } catch (err) {
    console.error("Failed to query notifications:", err);
    return { notifications: [], unreadCount: 0 };
  }
}

/**
 * Marks a single notification as read for the user
 */
export async function markNotificationAsRead(
  db: any,
  userId: string,
  notificationId: string
): Promise<boolean> {
  if (!db || !userId || !notificationId) return false;

  try {
    await ensureNotificationTable(db);
    const res = await db.prepare(
      "UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?"
    ).bind(notificationId, userId).run();

    return Boolean(res?.success || (res?.meta as any)?.changes > 0);
  } catch (e) {
    console.error("Error marking notification read:", e);
    return false;
  }
}

/**
 * Marks all notifications as read for the user
 */
export async function markAllNotificationsAsRead(
  db: any,
  userId: string,
  businessId?: string | null
): Promise<number> {
  if (!db || !userId) return 0;

  try {
    await ensureNotificationTable(db);
    let res;
    if (businessId && businessId.trim()) {
      res = await db.prepare(
        "UPDATE notifications SET read = 1 WHERE user_id = ? AND (business_id = ? OR business_id IS NULL) AND read = 0"
      ).bind(userId, businessId.trim()).run();
    } else {
      res = await db.prepare(
        "UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0"
      ).bind(userId).run();
    }

    return (res?.meta as any)?.changes || 0;
  } catch (e) {
    console.error("Error marking all notifications read:", e);
    return 0;
  }
}

/**
 * Deletes a single notification for the user
 */
export async function deleteNotificationForUser(
  db: any,
  userId: string,
  notificationId: string
): Promise<boolean> {
  if (!db || !userId || !notificationId) return false;

  try {
    await ensureNotificationTable(db);
    const res = await db.prepare(
      "DELETE FROM notifications WHERE id = ? AND user_id = ?"
    ).bind(notificationId, userId).run();

    return Boolean(res?.success || (res?.meta as any)?.changes > 0);
  } catch (e) {
    console.error("Error deleting notification:", e);
    return false;
  }
}
