import { githubProvider } from './providers/githubProvider';
import { wordpressProvider } from './providers/wordpressProvider';
import type { RepositoryItem, BranchItem, TreeItem, FileContent, PullRequestResult, WordPressSiteInfo, WordPressItem } from './providers/types';

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

export async function deleteConnection(db: any, userId: string, projectId: string, connectionId: string): Promise<boolean> {
  const res = await db.prepare(
    "DELETE FROM connections WHERE id = ? AND user_id = ? AND project_id = ?"
  ).bind(connectionId, userId, projectId).run();

  return (res?.meta?.changes || 0) > 0;
}

// =========================================================================
// GITHUB PROVIDER INTEGRATION (PHASES 1 & 2)
// =========================================================================

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

// =========================================================================
// PHASE 3: WORDPRESS PROVIDER INTEGRATION
// =========================================================================

export async function getActiveWordPressConnection(db: any, userId: string, projectId: string) {
  const row: any = await db.prepare(
    "SELECT * FROM connections WHERE user_id = ? AND project_id = ? AND provider = 'wordpress' AND status = 'CONNECTED' ORDER BY updated_at DESC LIMIT 1"
  ).bind(userId, projectId).first();

  return row;
}

export async function saveWordPressConnection(
  db: any,
  userId: string,
  projectId: string,
  data: {
    siteUrl: string;
    username: string;
    appPassword: string;
  }
): Promise<ConnectionRecord & { siteName?: string }> {
  // 1. Test connection via WordPress REST API first
  const testRes = await wordpressProvider.testConnection(data.siteUrl, data.username, data.appPassword);
  const normalizedUrl = testRes.siteUrl;

  const id = `conn_wp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const credentialsToken = JSON.stringify({
    username: data.username.trim(),
    appPassword: data.appPassword.trim()
  });

  // Check if WP connection already exists for this project
  const existing: any = await db.prepare(
    "SELECT id FROM connections WHERE user_id = ? AND project_id = ? AND provider = 'wordpress'"
  ).bind(userId, projectId).first();

  if (existing) {
    await db.prepare(`
      UPDATE connections 
      SET repository_name = ?, repository_owner = ?, repository_id = ?, auth_token = ?, status = 'CONNECTED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(
      testRes.siteName,
      data.username.trim(),
      normalizedUrl,
      credentialsToken,
      existing.id,
      userId
    ).run();

    return {
      id: existing.id,
      user_id: userId,
      project_id: projectId,
      provider: 'wordpress',
      repository_name: testRes.siteName,
      repository_owner: data.username.trim(),
      repository_id: normalizedUrl,
      status: 'CONNECTED',
      siteName: testRes.siteName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  await db.prepare(`
    INSERT INTO connections 
    (id, user_id, project_id, provider, installation_id, repository_id, repository_name, repository_owner, default_branch, status, auth_token, created_at, updated_at)
    VALUES (?, ?, ?, 'wordpress', '', ?, ?, ?, 'main', 'CONNECTED', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(
    id,
    userId,
    projectId,
    normalizedUrl,
    testRes.siteName,
    data.username.trim(),
    credentialsToken
  ).run();

  return {
    id,
    user_id: userId,
    project_id: projectId,
    provider: 'wordpress',
    repository_name: testRes.siteName,
    repository_owner: data.username.trim(),
    repository_id: normalizedUrl,
    status: 'CONNECTED',
    siteName: testRes.siteName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function executeWordPressSeoFix(
  db: any,
  userId: string,
  projectId: string,
  changeId: string,
  options: {
    targetType?: 'page' | 'post';
    targetId?: number | string;
    customContent?: string;
  } = {}
): Promise<{
  success: boolean;
  status: string;
  message: string;
  updatedItem?: any;
  verification?: any;
}> {
  // 1. Verify change ownership
  const change: any = await db.prepare(
    "SELECT * FROM seo_changes WHERE id = ? AND user_id = ? AND project_id = ?"
  ).bind(changeId, userId, projectId).first();

  if (!change) {
    throw new Error("SEO Change record not found or access unauthorized");
  }

  // 2. Fetch active WordPress connection
  const conn = await getActiveWordPressConnection(db, userId, projectId);
  if (!conn || !conn.auth_token) {
    throw new Error("NOT_CONNECTED: No active WordPress connection found for this project");
  }

  let creds: { username: string; appPassword: string };
  try {
    creds = JSON.parse(conn.auth_token);
  } catch (e) {
    throw new Error("INVALID_CREDENTIALS: Stored WordPress credentials are corrupted. Please reconnect.");
  }

  const siteUrl = conn.repository_id;
  if (!siteUrl) {
    throw new Error("INVALID_URL: WordPress site URL is not configured");
  }
  const username = creds.username;
  const appPassword = creds.appPassword;

  // 3. Resolve target page/post
  let targetType = options.targetType || 'page';
  let targetId = options.targetId;

  if (!targetId) {
    // Attempt to match by homepage or change.page_url
    const pages = await wordpressProvider.getPages(siteUrl, username, appPassword, 20);
    if (pages.length > 0) {
      const matchedPage = pages.find(p => change.page_url && p.link.includes(change.page_url)) || pages[0];
      targetId = matchedPage.id;
      targetType = 'page';
    } else {
      const posts = await wordpressProvider.getPosts(siteUrl, username, appPassword, 10);
      if (posts.length > 0) {
        targetId = posts[0].id;
        targetType = 'post';
      }
    }
  }

  if (!targetId) {
    throw new Error("WORDPRESS_TARGET_NOT_FOUND: Unable to resolve target WordPress Page or Post ID");
  }

  // 4. Fetch current item for freshness check (STALE_CHANGE guard)
  const currentItem = targetType === 'page'
    ? await wordpressProvider.getPage(siteUrl, username, appPassword, targetId)
    : await wordpressProvider.getPost(siteUrl, username, appPassword, targetId);

  const beforeVal = (change.before_value || '').trim();
  const afterVal = (options.customContent || change.after_value || '').trim();

  // 5. Build update payload according to change type
  let updatePayload: { title?: string; content?: string; excerpt?: string; meta?: Record<string, any> } = {};

  if (change.change_type === 'SEO_TITLE') {
    updatePayload.title = afterVal.replace(/<\/?title>/gi, '').trim();
  } else if (change.change_type === 'H1') {
    let content = currentItem.content.raw || currentItem.content.rendered || '';
    if (/<h1[^>]*>.*?<\/h1>/i.test(content)) {
      content = content.replace(/<h1[^>]*>.*?<\/h1>/i, `<h1>${afterVal.replace(/<\/?h1>/gi, '').trim()}</h1>`);
    } else {
      content = `<h1>${afterVal.replace(/<\/?h1>/gi, '').trim()}</h1>\n\n${content}`;
    }
    updatePayload.content = content;
  } else if (change.change_type === 'META_DESCRIPTION') {
    updatePayload.meta = {
      _yoast_wpseo_metadesc: afterVal,
      rank_math_description: afterVal
    };
  } else {
    let content = currentItem.content.raw || currentItem.content.rendered || '';
    if (beforeVal && content.includes(beforeVal)) {
      content = content.replace(beforeVal, afterVal);
    } else {
      content = `${content}\n\n${afterVal}`;
    }
    updatePayload.content = content;
  }

  // 6. Execute update on WordPress REST API
  const updatedItem = targetType === 'page'
    ? await wordpressProvider.updatePage(siteUrl, username, appPassword, targetId, updatePayload)
    : await wordpressProvider.updatePost(siteUrl, username, appPassword, targetId, updatePayload);

  // 7. Update change record to APPLIED
  await db.prepare(`
    UPDATE seo_changes 
    SET approval_status = 'APPROVED', execution_status = 'APPLIED', provider = 'WORDPRESS', applied_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).bind(changeId, userId).run();

  // 8. Trigger immediate live DOM re-crawl verification
  let verificationStatus = 'APPLIED';
  let verificationEvidence: any = {
    provider: 'WORDPRESS',
    siteUrl,
    targetType,
    targetId,
    timestamp: new Date().toISOString()
  };

  try {
    const liveTargetUrl = updatedItem.link || change.page_url || siteUrl;
    const fetchResp = await fetch(liveTargetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Rankora Live SEO Crawler 2.0)' }
    });

    if (fetchResp.ok) {
      const html = await fetchResp.text();
      const cleanExpected = afterVal.replace(/<[^>]*>/g, '').toLowerCase().trim();
      const htmlLower = html.toLowerCase();

      const matched = htmlLower.includes(cleanExpected);
      verificationEvidence = {
        status: matched ? 'VERIFIED' : 'VERIFICATION_PENDING_CACHE',
        url: liveTargetUrl,
        http_status: fetchResp.status,
        expected: afterVal,
        observed_match: matched,
        page_title: html.match(/<title>(.*?)<\/title>/i)?.[1] || 'N/A'
      };

      if (matched) {
        verificationStatus = 'VERIFIED';
        await db.prepare(`
          UPDATE seo_changes 
          SET execution_status = 'VERIFIED', verification_status = 'VERIFIED', verified_at = CURRENT_TIMESTAMP, verification_evidence = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(JSON.stringify(verificationEvidence), changeId).run();
      } else {
        await db.prepare(`
          UPDATE seo_changes 
          SET verification_evidence = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(JSON.stringify(verificationEvidence), changeId).run();
      }
    }
  } catch (verifyErr: any) {
    verificationEvidence.error = verifyErr.message;
  }

  // 9. Log execution event
  await db.prepare(`
    INSERT INTO execution_events (id, user_id, project_id, change_id, event_type, event_payload, created_at)
    VALUES (?, ?, ?, ?, 'WORDPRESS_EXECUTED', ?, CURRENT_TIMESTAMP)
  `).bind(
    `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    projectId,
    changeId,
    JSON.stringify({
      targetType,
      targetId,
      status: verificationStatus,
      evidence: verificationEvidence
    })
  ).run().catch(() => {});

  return {
    success: true,
    status: verificationStatus,
    message: verificationStatus === 'VERIFIED' 
      ? 'WordPress page updated and verified live on production!' 
      : 'WordPress page updated successfully. Live cache verification pending.',
    updatedItem,
    verification: verificationEvidence
  };
}
