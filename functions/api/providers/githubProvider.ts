import type { WebsiteProvider, RepositoryItem, BranchItem, TreeItem, FileContent, PullRequestResult } from './types';

export class GitHubProvider implements WebsiteProvider {
  readonly providerName = 'github';

  private async fetchGitHub(url: string, token: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Scorankio-SEO-Operator/2.0',
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
      if (url.includes('/contents/')) {
        const filePath = url.split('/contents/')[1]?.split('?')[0] || 'file';
        throw new Error(`FILE_NOT_FOUND: File '${decodeURIComponent(filePath)}' does not exist in this repository.`);
      }
      const repoMatch = url.match(/repos\/([^/]+\/[^/]+)/);
      const repoName = repoMatch ? repoMatch[1] : 'repository';
      throw new Error(`REPOSITORY_NOT_FOUND: GitHub repository '${repoName}' was not found on your GitHub account or is inaccessible with your token.`);
    }
    if (!response.ok) {
      const errJson: any = await response.json().catch(() => ({}));
      throw new Error(errJson?.message || `GitHub API error (${response.status})`);
    }

    return response.json();
  }

  async getRepositories(token: string): Promise<RepositoryItem[]> {
    let allRepos: any[] = [];
    for (let page = 1; page <= 10; page++) {
      const pageRepos: any = await this.fetchGitHub(
        `https://api.github.com/user/repos?sort=updated&per_page=100&page=${page}&affiliation=owner,collaborator,organization_member`,
        token
      ).catch(() => []);

      if (Array.isArray(pageRepos) && pageRepos.length > 0) {
        allRepos = allRepos.concat(pageRepos);
        if (pageRepos.length < 100) break;
      } else {
        break;
      }
    }

    return allRepos.map((r: any) => ({
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

  async getSingleRepository(token: string, owner: string, repo: string): Promise<RepositoryItem> {
    const r: any = await this.fetchGitHub(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      token
    );

    return {
      id: String(r.id),
      name: r.name,
      fullName: r.full_name,
      owner: r.owner?.login || '',
      defaultBranch: r.default_branch || 'main',
      isPrivate: Boolean(r.private),
      htmlUrl: r.html_url,
      description: r.description || '',
      updatedAt: r.updated_at
    };
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

  // =========================================================================
  // PHASE 2 WRITE METHODS (SAFE SEPARATE FEATURE BRANCHES)
  // =========================================================================

  async createBranch(token: string, owner: string, repo: string, baseBranch: string, newBranch: string): Promise<{ ref: string; sha: string }> {
    // 1. Get base branch commit SHA
    const baseRefData: any = await this.fetchGitHub(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(baseBranch)}`,
      token
    );

    const baseSha = baseRefData.object?.sha;
    if (!baseSha) {
      throw new Error(`Failed to resolve base commit SHA for branch '${baseBranch}'`);
    }

    // Clean branch name
    const safeBranchName = newBranch.replace(/^refs\/heads\//, '');

    // 2. Create new branch reference
    const createRefRes: any = await this.fetchGitHub(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      token,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: `refs/heads/${safeBranchName}`,
          sha: baseSha
        })
      }
    );

    return {
      ref: createRefRes.ref,
      sha: createRefRes.object?.sha || baseSha
    };
  }

  async updateFile(
    token: string,
    owner: string,
    repo: string,
    branch: string,
    path: string,
    content: string,
    commitMessage: string,
    previousSha?: string
  ): Promise<{ commitSha: string; contentSha: string }> {
    const cleanPath = path.replace(/^\//, '');

    let fileSha = previousSha;
    if (!fileSha) {
      const currentFile = await this.getFile(token, owner, repo, branch, cleanPath);
      fileSha = currentFile.sha;
    }

    // Convert UTF-8 content to base64
    const utf8Bytes = new TextEncoder().encode(content);
    let binaryStr = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binaryStr += String.fromCharCode(utf8Bytes[i]);
    }
    const base64Content = btoa(binaryStr);

    const res: any = await this.fetchGitHub(
      `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`,
      token,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: commitMessage,
          content: base64Content,
          branch: branch,
          ...(fileSha ? { sha: fileSha } : {})
        })
      }
    );

    return {
      commitSha: res.commit?.sha || '',
      contentSha: res.content?.sha || ''
    };
  }

  async createPullRequest(
    token: string,
    owner: string,
    repo: string,
    baseBranch: string,
    headBranch: string,
    title: string,
    body: string
  ): Promise<PullRequestResult> {
    const res: any = await this.fetchGitHub(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      token,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          head: headBranch,
          base: baseBranch,
          body
        })
      }
    );

    return {
      number: res.number,
      htmlUrl: res.html_url,
      id: res.id,
      state: res.state,
      merged: false
    };
  }

  async getPullRequest(token: string, owner: string, repo: string, pullNumber: number): Promise<PullRequestResult> {
    const res: any = await this.fetchGitHub(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      token
    );

    return {
      number: res.number,
      htmlUrl: res.html_url,
      id: res.id,
      state: res.state,
      merged: Boolean(res.merged)
    };
  }
}

export const githubProvider = new GitHubProvider();
