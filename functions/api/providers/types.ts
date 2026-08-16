export interface RepositoryItem {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  htmlUrl: string;
  description?: string;
  updatedAt?: string;
}

export interface BranchItem {
  name: string;
  commitSha: string;
  isProtected?: boolean;
}

export interface TreeItem {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  sha: string;
}

export interface FileContent {
  path: string;
  content: string;
  encoding: string;
  sha: string;
  size: number;
}

export interface PullRequestResult {
  number: number;
  htmlUrl: string;
  id: number;
  state: string;
  merged?: boolean;
}

export interface WebsiteProvider {
  readonly providerName: string;
  getRepositories(token: string): Promise<RepositoryItem[]>;
  getBranches(token: string, owner: string, repo: string): Promise<BranchItem[]>;
  getTree(token: string, owner: string, repo: string, branch: string, path?: string): Promise<TreeItem[]>;
  getFile(token: string, owner: string, repo: string, branch: string, path: string): Promise<FileContent>;
  
  // Phase 2: Safe Approval-based Write Operations
  createBranch(token: string, owner: string, repo: string, baseBranch: string, newBranch: string): Promise<{ ref: string; sha: string }>;
  updateFile(token: string, owner: string, repo: string, branch: string, path: string, content: string, commitMessage: string, previousSha?: string): Promise<{ commitSha: string; contentSha: string }>;
  createPullRequest(token: string, owner: string, repo: string, baseBranch: string, headBranch: string, title: string, body: string): Promise<PullRequestResult>;
  getPullRequest(token: string, owner: string, repo: string, pullNumber: number): Promise<PullRequestResult>;
}
