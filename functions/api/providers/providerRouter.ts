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
 * Universal SEO Execution Router
 * Automatically determines active execution provider (GitHub, WordPress, Shopify, or Manual)
 * and executes approved changes safely with tenant isolation.
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
  // Check active connections in parallel
  const [ghConn, wpConn, shConn] = await Promise.all([
    getActiveGitHubConnection(db, userId, projectId),
    getActiveWordPressConnection(db, userId, projectId),
    getActiveShopifyConnection(db, userId, projectId)
  ]);

  if (shConn) {
    const res = await executeShopifySeoFix(db, userId, projectId, changeId, {
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      customContent: options.customContent
    });

    return {
      provider: 'shopify',
      status: res.status as any,
      verification: res.verification,
      details: res.updatedItem,
      message: res.message
    };
  }

  if (wpConn) {
    const res = await executeWordPressSeoFix(db, userId, projectId, changeId, {
      targetType: options.resourceType === 'article' ? 'post' : 'page',
      targetId: options.resourceId,
      customContent: options.customContent
    });

    return {
      provider: 'wordpress',
      status: res.status as any,
      verification: res.verification,
      details: res.updatedItem,
      message: res.message
    };
  }

  if (ghConn) {
    const res = await executeGitHubSeoFix(db, userId, projectId, changeId, {
      targetFilePath: options.targetFilePath,
      customCommitMessage: options.customCommitMessage
    });

    return {
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
  }

  // Fallback: No automated CMS/repo connected $\to$ Manual mode
  await db.prepare(`
    UPDATE seo_changes 
    SET approval_status = 'APPROVED', execution_status = 'APPLIED', provider = 'MANUAL', applied_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).bind(changeId, userId).run();

  return {
    provider: 'manual',
    status: 'APPLIED',
    message: 'Change approved for manual implementation. Deploy snippet and trigger Live Verification.'
  };
}
