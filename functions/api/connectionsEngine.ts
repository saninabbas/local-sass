import { githubProvider } from './providers/githubProvider';
import type { RepositoryItem, BranchItem, TreeItem, FileContent, PullRequestResult } from './providers/types';

export interface ConnectionRecord {
  id: string;
  user_id: string;
  project_id: string;
  provider: string;
  installation_id?: string | null;
  repository_id?: string | null;
  repository_name?: string | null;
  repository_owner?: string | null;
  default_branch?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getProjectConnections(db: any, userId: string, projectId: string): Promise<ConnectionRecord[]> {
  const { results } = await db.prepare(
    "SELECT id, user_id, project_id, provider, installation_id, repository_id, repository_name, repository_owner, default_branch, status, created_at, updated_at FROM connections WHERE user_id = ? AND project_id = ? ORDER BY created_at DESC"
  ).bind(userId, projectId).all();

  return (results || []) as ConnectionRecord[];
}

export async function getActiveGitHubConnection(db: any, userId: string, projectId: string) {
  const row: any = await db.prepare(
    "SELECT * FROM connections WHERE user_id = ? AND project_id = ? AND provider = 'github' AND status = 'CONNECTED' ORDER BY updated_at DESC LIMIT 1"
  ).bind(userId, projectId).first();

  return row;
}

export async function saveGitHubConnection(
  db: any,
  userId: string,
  projectId: string,
  data: {
    repositoryName: string;
    repositoryOwner: string;
    repositoryId?: string;
    defaultBranch?: string;
    installationId?: string;
    token?: string;
  }
): Promise<ConnectionRecord> {
  const id = `conn_gh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const defaultBranch = data.defaultBranch || 'main';

  // Check if connection already exists for this project + repo
  const existing: any = await db.prepare(
    "SELECT id, auth_token FROM connections WHERE user_id = ? AND project_id = ? AND provider = 'github'"
  ).bind(userId, projectId).first();

  const tokenToSave = data.token || existing?.auth_token || '';

  if (existing) {
    await db.prepare(`
      UPDATE connections 
      SET repository_name = ?, repository_owner = ?, repository_id = ?, default_branch = ?, installation_id = ?, auth_token = ?, status = 'CONNECTED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(
      data.repositoryName,
      data.repositoryOwner,
      data.repositoryId || '',
      defaultBranch,
      data.installationId || '',
      tokenToSave,
      existing.id,
      userId
    ).run();

    return {
      id: existing.id,
      user_id: userId,
      project_id: projectId,
      provider: 'github',
      installation_id: data.installationId,
      repository_id: data.repositoryId,
      repository_name: data.repositoryName,
      repository_owner: data.repositoryOwner,
      default_branch: defaultBranch,
      status: 'CONNECTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  await db.prepare(`
    INSERT INTO connections 
    (id, user_id, project_id, provider, installation_id, repository_id, repository_name, repository_owner, default_branch, status, auth_token, created_at, updated_at)
    VALUES (?, ?, ?, 'github', ?, ?, ?, ?, ?, 'CONNECTED', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(
    id,
    userId,
    projectId,
    data.installationId || '',
    data.repositoryId || '',
    data.repositoryName,
    data.repositoryOwner,
    defaultBranch,
    tokenToSave
  ).run();

  return {
    id,
    user_id: userId,
    project_id: projectId,
    provider: 'github',
    installation_id: data.installationId,
    repository_id: data.repositoryId,
    repository_name: data.repositoryName,
    repository_owner: data.repositoryOwner,
    default_branch: defaultBranch,
    status: 'CONNECTED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function deleteConnection(db: any, userId: string, projectId: string, connectionId: string): Promise<boolean> {
  const res = await db.prepare(
    "DELETE FROM connections WHERE id = ? AND user_id = ? AND project_id = ?"
  ).bind(connectionId, userId, projectId).run();

  return (res?.meta?.changes || 0) > 0;
}

// =========================================================================
// PHASE 2: SAFE APPROVAL-BASED SEO CODE EXECUTION ENGINE
// =========================================================================

export async function executeGitHubSeoFix(
  db: any,
  userId: string,
  projectId: string,
  changeId: string,
  options: {
    targetFilePath?: string;
    customCommitMessage?: string;
  } = {}
): Promise<{
  success: boolean;
  branch: string;
  commitSha: string;
  pullRequestNumber: number;
  pullRequestUrl: string;
  status: string;
  message: string;
}> {
  // 1. Verify change ownership
  const change: any = await db.prepare(
    "SELECT * FROM seo_changes WHERE id = ? AND user_id = ? AND project_id = ?"
  ).bind(changeId, userId, projectId).first();

  if (!change) {
    throw new Error("SEO Change record not found or access unauthorized");
  }

  // 2. Fetch project active GitHub connection
  const conn = await getActiveGitHubConnection(db, userId, projectId);
  if (!conn || !conn.auth_token) {
    throw new Error("NOT_CONNECTED: No active GitHub connection found for this project");
  }

  const owner = conn.repository_owner;
  const repo = conn.repository_name;
  const baseBranch = conn.default_branch || 'main';
  const token = conn.auth_token;

  // Resolve target file path (default to index.html or targetFilePath or page.tsx)
  const targetFilePath = options.targetFilePath || change.file_path || 'index.html';

  // 3. Read current file to verify freshness (STALE_CHANGE guard)
  const currentFile = await githubProvider.getFile(token, owner, repo, baseBranch, targetFilePath);
  
  // Stale check if initial_file_sha was stored
  if (change.initial_file_sha && change.initial_file_sha !== currentFile.sha) {
    await db.prepare("UPDATE seo_changes SET execution_status = 'STALE_CHANGE', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(changeId).run();
    throw new Error("STALE_CHANGE: The target file on GitHub was modified after this fix was generated. Please regenerate the fix.");
  }

  // 4. Create safe deterministic feature branch
  const slug = (change.change_type || 'seo-fix').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const featureBranch = `rankora/seo-fix/${slug}-${changeId.substring(0, 8)}`;

  await githubProvider.createBranch(token, owner, repo, baseBranch, featureBranch);

  // 5. Apply fix in file content
  let updatedContent = currentFile.content;
  const beforeVal = (change.before_value || '').trim();
  const afterVal = (change.after_value || '').trim();

  if (beforeVal && updatedContent.includes(beforeVal)) {
    updatedContent = updatedContent.replace(beforeVal, afterVal);
  } else if (change.change_type === 'SEO_TITLE' && afterVal) {
    if (/<title>.*?<\/title>/i.test(updatedContent)) {
      updatedContent = updatedContent.replace(/<title>.*?<\/title>/i, `<title>${afterVal}</title>`);
    } else {
      updatedContent = updatedContent.replace(/<\/head>/i, `  <title>${afterVal}</title>\n</head>`);
    }
  } else if (change.change_type === 'META_DESCRIPTION' && afterVal) {
    if (/<meta\s+name=["']description["'][^>]*>/i.test(updatedContent)) {
      updatedContent = updatedContent.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${afterVal}">`);
    } else {
      updatedContent = updatedContent.replace(/<\/head>/i, `  <meta name="description" content="${afterVal}">\n</head>`);
    }
  } else if (change.change_type === 'LOCALBUSINESS_SCHEMA' && afterVal) {
    updatedContent = updatedContent.replace(/<\/body>/i, `  ${afterVal}\n</body>`);
  } else {
    updatedContent = updatedContent.includes(beforeVal) ? updatedContent.replace(beforeVal, afterVal) : updatedContent;
  }

  // 6. Commit the file update
  const commitMsg = options.customCommitMessage || `Rankora SEO Fix: ${change.change_type} (${changeId.substring(0, 8)})`;
  const commitResult = await githubProvider.updateFile(
    token,
    owner,
    repo,
    featureBranch,
    targetFilePath,
    updatedContent,
    commitMsg,
    currentFile.sha
  );

  // 7. Create Pull Request
  const prTitle = `Rankora SEO Fix: ${change.change_type.replace(/_/g, ' ')}`;
  const prBody = `## 🚀 Rankora SEO Fix

**Project:** ${projectId}
**Change Type:** ${change.change_type}
**File:** \`${targetFilePath}\`

### 📋 Before
\`\`\`html
${beforeVal || '(No existing value)'}
\`\`\`

### ✨ After (Proposed)
\`\`\`html
${afterVal}
\`\`\`

---
*Generated automatically by Rankora SEO Operating System.*
*Live DOM verification will be triggered automatically upon merging this Pull Request.*`;

  const prResult = await githubProvider.createPullRequest(
    token,
    owner,
    repo,
    baseBranch,
    featureBranch,
    prTitle,
    prBody
  );

  // 8. Update D1 seo_changes record
  await db.prepare(`
    UPDATE seo_changes 
    SET repository_owner = ?, repository_name = ?, base_branch = ?, feature_branch = ?, file_path = ?, commit_sha = ?, pull_request_number = ?, pull_request_url = ?, approval_status = 'APPROVED', execution_status = 'PR_CREATED', provider = 'GITHUB', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).bind(
    owner,
    repo,
    baseBranch,
    featureBranch,
    targetFilePath,
    commitResult.commitSha,
    prResult.number,
    prResult.htmlUrl,
    changeId,
    userId
  ).run();

  // 9. Log execution event
  await db.prepare(`
    INSERT INTO execution_events (id, user_id, project_id, change_id, event_type, event_payload, created_at)
    VALUES (?, ?, ?, ?, 'GITHUB_PR_CREATED', ?, CURRENT_TIMESTAMP)
  `).bind(
    `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    projectId,
    changeId,
    JSON.stringify({
      prNumber: prResult.number,
      prUrl: prResult.htmlUrl,
      branch: featureBranch,
      commitSha: commitResult.commitSha
    })
  ).run().catch(() => {});

  return {
    success: true,
    branch: featureBranch,
    commitSha: commitResult.commitSha,
    pullRequestNumber: prResult.number,
    pullRequestUrl: prResult.htmlUrl,
    status: 'PR_CREATED',
    message: `Pull Request #${prResult.number} created successfully on branch '${featureBranch}'.`
  };
}

export async function checkGitHubPullRequestStatus(
  db: any,
  userId: string,
  projectId: string,
  changeId: string
): Promise<{
  merged: boolean;
  state: string;
  pullRequestUrl: string;
  pullRequestNumber: number;
}> {
  const change: any = await db.prepare(
    "SELECT * FROM seo_changes WHERE id = ? AND user_id = ? AND project_id = ?"
  ).bind(changeId, userId, projectId).first();

  if (!change || !change.pull_request_number) {
    throw new Error("Change record has no associated Pull Request");
  }

  const conn = await getActiveGitHubConnection(db, userId, projectId);
  if (!conn || !conn.auth_token) {
    throw new Error("NOT_CONNECTED: No active GitHub connection");
  }

  const pr = await githubProvider.getPullRequest(
    conn.auth_token,
    change.repository_owner || conn.repository_owner,
    change.repository_name || conn.repository_name,
    change.pull_request_number
  );

  if (pr.merged && change.execution_status !== 'MERGED' && change.execution_status !== 'VERIFIED') {
    await db.prepare(
      "UPDATE seo_changes SET execution_status = 'MERGED', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(changeId).run();
  }

  return {
    merged: pr.merged || false,
    state: pr.state,
    pullRequestUrl: pr.htmlUrl,
    pullRequestNumber: pr.number
  };
}
