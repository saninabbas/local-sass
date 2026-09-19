import { 
  getActiveGitHubConnection, 
  getActiveWordPressConnection, 
  getActiveShopifyConnection, 
  executeGitHubSeoFix, 
  executeWordPressSeoFix, 
  executeShopifySeoFix 
} from '../connectionsEngine';
import type { UniversalExecutionResult } from './types';

/**
 * Universal SEO Execution Router (Phase 5 Hardened)
 * Automatically detects active provider (GitHub, WordPress, Shopify, or Manual),
 * enforces state machine transitions, records execution telemetry, and verifies live DOM changes.
 */
export async function routeApprovedSeoFix(
  db: any,
  userId: string,
  projectId: string,
  changeId: string,
  options: {
    targetFilePath?: string;
    resourceType?: 'product' | 'page' | 'article';
    resourceId?: number | string;
    customContent?: string;
    customCommitMessage?: string;
  } = {}
): Promise<UniversalExecutionResult> {
  const executionStartTime = Date.now();
  const startTimeIso = new Date().toISOString();

  // 1. Validate change existence & ownership
  const change: any = await db.prepare(
    "SELECT * FROM seo_changes WHERE id = ? AND user_id = ? AND project_id = ?"
  ).bind(changeId, userId, projectId).first();

  if (!change) {
    throw new Error("RESOURCE_NOT_FOUND: SEO change record does not exist or tenant access forbidden");
  }

  // 2. Mark state as EXECUTING
  await db.prepare(`
    UPDATE seo_changes 
    SET execution_status = 'EXECUTING', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).bind(changeId, userId).run();

  let result: UniversalExecutionResult;
  let activeProvider = 'manual';

  try {
    // 3. Detect active connection
    const [ghConn, wpConn, shConn] = await Promise.all([
      getActiveGitHubConnection(db, userId, projectId),
      getActiveWordPressConnection(db, userId, projectId),
      getActiveShopifyConnection(db, userId, projectId)
    ]);

    if (shConn) {
      activeProvider = 'shopify';
      const res = await executeShopifySeoFix(db, userId, projectId, changeId, {
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        customContent: options.customContent
      });

      result = {
        provider: 'shopify',
        status: res.status as any,
        verification: res.verification,
        details: res.updatedItem,
        message: res.message
      };
    } else if (wpConn) {
      activeProvider = 'wordpress';
      const res = await executeWordPressSeoFix(db, userId, projectId, changeId, {
        targetType: options.resourceType === 'article' ? 'post' : 'page',
        targetId: options.resourceId,
        customContent: options.customContent
      });

      result = {
        provider: 'wordpress',
        status: res.status as any,
        verification: res.verification,
        details: res.updatedItem,
        message: res.message
      };
    } else if (ghConn) {
      activeProvider = 'github';
      const res = await executeGitHubSeoFix(db, userId, projectId, changeId, {
        targetFilePath: options.targetFilePath,
        customCommitMessage: options.customCommitMessage
      });

      result = {
        provider: 'github',
        status: res.status as any,
        details: {
          branch: res.branch,
          commitSha: res.commitSha,
          pullRequestNumber: res.pullRequestNumber,
          pullRequestUrl: res.pullRequestUrl
        },
        message: res.message
      };
    } else {
      activeProvider = 'manual';
      await db.prepare(`
        UPDATE seo_changes 
        SET approval_status = 'APPROVED', execution_status = 'COMPLETED', provider = 'MANUAL', applied_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `).bind(changeId, userId).run();

      result = {
        provider: 'manual',
        status: 'COMPLETED',
        message: 'Change approved for manual implementation. Deploy snippet and trigger Live Verification.'
      };
    }

    const durationMs = Date.now() - executionStartTime;
    const finishedTimeIso = new Date().toISOString();

    // 4. Log structured execution telemetry
    await db.prepare(`
      INSERT INTO execution_events (id, user_id, project_id, change_id, event_type, event_payload, created_at)
      VALUES (?, ?, ?, ?, 'UNIVERSAL_EXECUTION_COMPLETED', ?, CURRENT_TIMESTAMP)
    `).bind(
      `telemetry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      projectId,
      changeId,
      JSON.stringify({
        provider: activeProvider,
        status: result.status,
        duration_ms: durationMs,
        started_at: startTimeIso,
        finished_at: finishedTimeIso,
        verification: result.verification || null
      })
    ).run().catch(() => {});

    return result;

  } catch (err: any) {
    const durationMs = Date.now() - executionStartTime;
    const errorMsg = err.message || 'Execution error';
    const errorCode = errorMsg.includes('STALE') ? 'STALE_CHANGE' :
      errorMsg.includes('CREDENTIALS') || errorMsg.includes('AUTH') ? 'AUTH_FAILED' :
      errorMsg.includes('CONNECTION') ? 'CONNECTION_FAILED' :
      errorMsg.includes('PERMISSION') ? 'PERMISSION_DENIED' : 'PROVIDER_ERROR';

    // Persist failure status in D1
    await db.prepare(`
      UPDATE seo_changes 
      SET execution_status = ?, verification_status = 'FAILED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(errorCode === 'STALE_CHANGE' ? 'STALE_CHANGE' : 'FAILED', changeId, userId).run().catch(() => {});

    // Log failure telemetry
    await db.prepare(`
      INSERT INTO execution_events (id, user_id, project_id, change_id, event_type, event_payload, created_at)
      VALUES (?, ?, ?, ?, 'UNIVERSAL_EXECUTION_FAILED', ?, CURRENT_TIMESTAMP)
    `).bind(
      `telemetry_err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      projectId,
      changeId,
      JSON.stringify({
        provider: activeProvider,
        status: 'FAILED',
        error_code: errorCode,
        error_message: errorMsg,
        duration_ms: durationMs,
        started_at: startTimeIso,
        finished_at: new Date().toISOString()
      })
    ).run().catch(() => {});

    throw new Error(`${errorCode}: ${errorMsg}`);
  }
}
