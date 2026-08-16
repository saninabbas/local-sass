import type { WebsiteProvider, RepositoryItem, BranchItem, TreeItem, FileContent } from './types';

export class GitHubProvider implements WebsiteProvider {
  readonly providerName = 'github';

  private async fetchGitHub(url: string, token: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Rankora-SEO-Operator/2.0',
      'Authorization': `Bearer ${token}`,
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      throw new Error('UNAUTHORIZED: Invalid or expired GitHub token');
    }
    if (response.status === 404) {
      throw new Error('REPOSITORY_NOT_FOUND: GitHub repository or resource not found');
    }
    if (!response.ok) {
      const errJson: any = await response.json().catch(() => ({}));
      throw new Error(errJson?.message || `GitHub API error (${response.status})`);
    }

    return response.json();
  }

  async getRepositories(token: string): Promise<RepositoryItem[]> {
    const repos: any = await this.fetchGitHub(
      'https://api.github.com/user/repos?sort=updated&per_page=50&affiliation=owner,collaborator,organization_member',
      token
    );

    if (!Array.isArray(repos)) {
      return [];
    }

    return repos.map((r: any) => ({
      id: String(r.id),
      name: r.name,
      fullName: r.full_name,
      owner: r.owner?.login || '',
      defaultBranch: r.default_branch || 'main',
      isPrivate: Boolean(r.private),
      htmlUrl: r.html_url,
      description: r.description || '',
      updatedAt: r.updated_at
    }));
  }

  async getBranches(token: string, owner: string, repo: string): Promise<BranchItem[]> {
    const branches: any = await this.fetchGitHub(
      `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
      token
    );

    if (!Array.isArray(branches)) {
      return [];
    }

    return branches.map((b: any) => ({
      name: b.name,
      commitSha: b.commit?.sha || '',
      isProtected: Boolean(b.protected)
    }));
  }

  async getTree(token: string, owner: string, repo: string, branch: string, path?: string): Promise<TreeItem[]> {
    // If a subpath is provided, fetch via contents API, otherwise fetch git tree
    if (path && path.trim() !== '') {
      const cleanPath = path.replace(/^\//, '');
      const contents: any = await this.fetchGitHub(
        `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}?ref=${encodeURIComponent(branch)}`,
        token
      );

      if (Array.isArray(contents)) {
        return contents.map((c: any) => ({
          path: c.path,
          type: c.type === 'dir' ? 'tree' : 'blob',
          size: c.size,
          sha: c.sha
        }));
      }
      return [];
    }

    // Root git tree
    const treeData: any = await this.fetchGitHub(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}`,
      token
    );

    if (!treeData || !Array.isArray(treeData.tree)) {
      return [];
    }

    return treeData.tree.map((t: any) => ({
      path: t.path,
      type: t.type === 'tree' ? 'tree' : 'blob',
      size: t.size,
      sha: t.sha
    }));
  }

  async getFile(token: string, owner: string, repo: string, branch: string, path: string): Promise<FileContent> {
    const cleanPath = path.replace(/^\//, '');
    const data: any = await this.fetchGitHub(
      `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}?ref=${encodeURIComponent(branch)}`,
      token
    );

    if (!data || Array.isArray(data)) {
      throw new Error("Target path is a directory, not a file.");
    }

    let decodedContent = '';
    if (data.encoding === 'base64' && data.content) {
      try {
        decodedContent = atob(data.content.replace(/\s/g, ''));
      } catch (e) {
        decodedContent = data.content;
      }
    } else {
      decodedContent = data.content || '';
    }

    return {
      path: data.path,
      content: decodedContent,
      encoding: 'utf-8',
      sha: data.sha,
      size: data.size || decodedContent.length
    };
  }
}

export const githubProvider = new GitHubProvider();
