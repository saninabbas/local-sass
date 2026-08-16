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

export interface WebsiteProvider {
  readonly providerName: string;
  getRepositories(token: string): Promise<RepositoryItem[]>;
  getBranches(token: string, owner: string, repo: string): Promise<BranchItem[]>;
  getTree(token: string, owner: string, repo: string, branch: string, path?: string): Promise<TreeItem[]>;
  getFile(token: string, owner: string, repo: string, branch: string, path: string): Promise<FileContent>;
}
