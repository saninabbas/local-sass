import { githubProvider } from './providers/githubProvider';
import type { RepositoryItem, BranchItem, TreeItem, FileContent } from './providers/types';

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
