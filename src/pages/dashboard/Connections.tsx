import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useBusiness } from '../../context/BusinessContext';
import { 
  getConnections, 
  saveGitHubConnection, 
  deleteConnection, 
  getGitHubRepositories, 
  getGitHubBranches, 
  getGitHubTree, 
  getGitHubFile 
} from '../../lib/api';
import { 
  GitBranch, 
  Folder, 
  FileCode, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronRight, 
  FileText, 
  Lock, 
  Eye, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Connections: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Connection Modal state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [gitHubToken, setGitHubToken] = useState('');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [savingConnection, setSavingConnection] = useState(false);

  // Repository Explorer state
  const [treeItems, setTreeItems] = useState<any[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string; size: number } | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const activeGitHubConnection = connections.find(c => c.provider === 'github' && c.status === 'CONNECTED');

  const loadConnections = async () => {
    try {
      setLoading(true);
      const res = await getConnections();
      setConnections(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.warn("Failed to load connections:", err.message);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
    // Reset file explorer when active business changes
    setSelectedFile(null);
    setCurrentPath('');
    setTreeItems([]);
  }, [activeBusiness?.id]);

  useEffect(() => {
    const handleBizSwitch = () => loadConnections();
    window.addEventListener('rankora:business_switched', handleBizSwitch);
    return () => window.removeEventListener('rankora:business_switched', handleBizSwitch);
  }, []);

  // Fetch Tree when active GitHub connection is present
  useEffect(() => {
    if (activeGitHubConnection) {
      loadTree(activeGitHubConnection.repository_owner, activeGitHubConnection.repository_name, activeGitHubConnection.default_branch || 'main');
    }
  }, [activeGitHubConnection?.id, activeGitHubConnection?.default_branch]);

  const loadTree = async (owner: string, repo: string, branch: string, path: string = '') => {
    try {
      setLoadingTree(true);
      const items = await getGitHubTree(owner, repo, branch, path);
      setTreeItems(Array.isArray(items) ? items : []);
      setCurrentPath(path);
    } catch (err: any) {
      console.warn("Failed to load repo tree:", err.message);
      setTreeItems([]);
    } finally {
      setLoadingTree(false);
    }
  };

  const handleFetchRepos = async () => {
    try {
      setLoadingRepos(true);
      setRepositories([]);
      setSelectedRepo(null);
      const repos = await getGitHubRepositories(gitHubToken.trim() || undefined);
      setRepositories(Array.isArray(repos) ? repos : []);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to retrieve repositories.' });
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleSelectRepo = async (repo: any) => {
    setSelectedRepo(repo);
    setSelectedBranch(repo.defaultBranch || 'main');
    try {
      const bList = await getGitHubBranches(repo.owner, repo.name, gitHubToken.trim() || undefined);
      setBranches(Array.isArray(bList) ? bList : []);
    } catch (err: any) {
      console.warn("Failed to fetch branches:", err.message);
      setBranches([{ name: repo.defaultBranch || 'main' }]);
    }
  };

  const handleSaveConnection = async () => {
    if (!selectedRepo) return;
    try {
      setSavingConnection(true);
      await saveGitHubConnection({
        repositoryName: selectedRepo.name,
        repositoryOwner: selectedRepo.owner,
        repositoryId: selectedRepo.id,
        defaultBranch: selectedBranch,
        token: gitHubToken.trim() || undefined
      });

      setFeedback({ type: 'success', message: `Connected repository ${selectedRepo.owner}/${selectedRepo.name} (${selectedBranch})!` });
      setTimeout(() => setFeedback(null), 4000);
      setIsConnectModalOpen(false);
      await loadConnections();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save connection.' });
    } finally {
      setSavingConnection(false);
    }
  };

  const handleDisconnect = async (connId: string) => {
    if (!window.confirm("Are you sure you want to disconnect this repository from the current project?")) return;
    try {
      await deleteConnection(connId);
      setFeedback({ type: 'success', message: "Repository connection removed." });
      setTimeout(() => setFeedback(null), 4000);
      setTreeItems([]);
      setSelectedFile(null);
      await loadConnections();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to disconnect.' });
    }
  };

  const handleOpenFile = async (item: any) => {
    if (!activeGitHubConnection) return;
    try {
      setLoadingFile(true);
      const fileData = await getGitHubFile(
        activeGitHubConnection.repository_owner,
        activeGitHubConnection.repository_name,
        activeGitHubConnection.default_branch || 'main',
        item.path
      );
      setSelectedFile(fileData);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to read file contents.' });
    } finally {
      setLoadingFile(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6dfd8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#cc785c]/10 text-[#cc785c] text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                <GitBranch size={12} />
                Phase 1 Execution Architecture
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
              Website Connections & Code Repositories
            </h1>
            <p className="text-xs text-[#6c6a64] font-sans mt-1">
              Secure, read-only repository integration for <strong className="text-[#141413]">{activeBusiness?.name || 'Current Project'}</strong> ({activeBusiness?.website_url}).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={loadConnections}
              disabled={loading}
              className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-[#cc785c]" : "text-[#8e8b82]"} />
              <span>Refresh Connections</span>
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <AlertCircle size={16} className="text-red-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Provider Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. GITHUB (Active Phase 1) */}
          <div className={`rounded-2xl p-6 border transition-all flex flex-col justify-between ${
            activeGitHubConnection 
              ? 'bg-white border-[#cc785c]/40 shadow-xs' 
              : 'bg-white border-[#e6dfd8] shadow-2xs hover:border-[#cc785c]/30'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#141413] text-white flex items-center justify-center font-bold text-sm">
                  GH
                </div>
                {activeGitHubConnection ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    CONNECTED
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#efe9de] text-[#8e8b82] border border-[#e6dfd8]">
                    AVAILABLE
                  </span>
                )}
              </div>

              <h2 className="text-lg font-serif font-bold text-[#141413] mb-1">GitHub Repository</h2>
              <p className="text-xs text-[#6c6a64] font-sans leading-relaxed mb-4">
                Connect your custom-code website repository for automated structure inspection and future AI SEO pull requests.
              </p>

              {activeGitHubConnection && (
                <div className="p-3 bg-[#faf9f5] border border-[#e6dfd8] rounded-xl space-y-1.5 mb-4 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8e8b82]">Repo:</span>
                    <span className="font-bold text-[#141413] truncate max-w-[160px]">
                      {activeGitHubConnection.repository_owner}/{activeGitHubConnection.repository_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8e8b82]">Branch:</span>
                    <span className="font-bold text-[#cc785c]">{activeGitHubConnection.default_branch || 'main'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8e8b82]">Permissions:</span>
                    <span className="text-emerald-700 font-bold">Read-Only</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#e6dfd8]/60 flex items-center justify-between gap-3">
              {activeGitHubConnection ? (
                <>
                  <button
                    onClick={() => handleDisconnect(activeGitHubConnection.id)}
                    className="text-xs font-sans font-medium text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Disconnect</span>
                  </button>
                  <Button
                    size="sm"
                    onClick={() => setIsConnectModalOpen(true)}
                    className="bg-[#faf9f5] border border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de] text-xs font-semibold"
                  >
                    Change Repo
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsConnectModalOpen(true)}
                  className="w-full bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <GitBranch size={13} className="text-[#cc785c]" />
                  <span>Connect GitHub</span>
                </Button>
              )}
            </div>
          </div>

          {/* 2. WORDPRESS (Phase 2 Roadmap) */}
          <div className="rounded-2xl p-6 border border-[#e6dfd8] bg-[#faf9f5]/50 flex flex-col justify-between opacity-80">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0073aa] text-white flex items-center justify-center font-bold text-sm">
                  WP
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#efe9de] text-[#8e8b82] border border-[#e6dfd8]">
                  PHASE 2
                </span>
              </div>
              <h2 className="text-lg font-serif font-bold text-[#141413] mb-1">WordPress Integration</h2>
              <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">
                Direct integration via Rankora WordPress Plugin for automated SEO meta injection and Yoast/RankMath syncing.
              </p>
            </div>
            <div className="pt-4 border-t border-[#e6dfd8]/60">
              <span className="text-[11px] font-mono text-[#8e8b82]">Coming Soon in Phase 2</span>
            </div>
          </div>

          {/* 3. SHOPIFY (Phase 2 Roadmap) */}
          <div className="rounded-2xl p-6 border border-[#e6dfd8] bg-[#faf9f5]/50 flex flex-col justify-between opacity-80">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#96bf48] text-white flex items-center justify-center font-bold text-sm">
                  SH
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#efe9de] text-[#8e8b82] border border-[#e6dfd8]">
                  PHASE 2
                </span>
              </div>
              <h2 className="text-lg font-serif font-bold text-[#141413] mb-1">Shopify Store</h2>
              <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">
                App bridge for automated Liquid template schema markup and collection page canonicalization.
              </p>
            </div>
            <div className="pt-4 border-t border-[#e6dfd8]/60">
              <span className="text-[11px] font-mono text-[#8e8b82]">Coming Soon in Phase 2</span>
            </div>
          </div>
        </div>

        {/* REPOSITORY STRUCTURE EXPLORER (READ ONLY) */}
        {activeGitHubConnection && (
          <div className="rounded-2xl border border-[#e6dfd8] bg-white p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6dfd8]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8b82] block mb-1">
                  Read-Only Inspection Engine
                </span>
                <h2 className="text-xl font-serif font-bold text-[#141413] flex items-center gap-2">
                  <span>Repository Explorer:</span>
                  <span className="font-mono text-base font-normal text-[#cc785c]">
                    {activeGitHubConnection.repository_owner}/{activeGitHubConnection.repository_name} ({activeGitHubConnection.default_branch || 'main'})
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#8e8b82]">
                <Lock size={13} className="text-emerald-600" />
                <span>Scope: Contents (Read-Only)</span>
              </div>
            </div>

            {/* Explorer Layout: Tree on Left, File Viewer on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[420px]">
              
              {/* Left Column: File Tree */}
              <div className="lg:col-span-5 border border-[#e6dfd8] rounded-xl bg-[#faf9f5] p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e6dfd8] text-[11px] font-mono text-[#8e8b82]">
                    <span>File Tree</span>
                    <span>{treeItems.length} items</span>
                  </div>

                  {loadingTree ? (
                    <div className="py-12 text-center text-xs font-mono text-[#8e8b82] flex items-center justify-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-[#cc785c]" />
                      <span>Reading repository tree...</span>
                    </div>
                  ) : treeItems.length === 0 ? (
                    <div className="py-12 text-center text-xs font-sans text-[#8e8b82]">
                      No files found in this repository branch.
                    </div>
                  ) : (
                    <div className="max-h-[380px] overflow-y-auto space-y-0.5 text-xs font-mono">
                      {treeItems.slice(0, 50).map((item) => {
                        const isDir = item.type === 'tree';
                        const isSelected = selectedFile?.path === item.path;

                        return (
                          <button
                            key={item.path}
                            onClick={() => !isDir && handleOpenFile(item)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-[#efe9de] text-[#141413] font-bold' 
                                : 'text-[#6c6a64] hover:bg-[#efe9de]/50 hover:text-[#141413]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {isDir ? <Folder size={14} className="text-[#cc785c] shrink-0" /> : <FileCode size={14} className="text-[#8e8b82] shrink-0" />}
                              <span className="truncate">{item.path}</span>
                            </div>
                            {!isDir && <Eye size={12} className="text-[#8e8b82] opacity-60 hover:opacity-100 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#e6dfd8] text-[10px] font-mono text-[#8e8b82] flex items-center justify-between">
                  <span>Branch: {activeGitHubConnection.default_branch || 'main'}</span>
                  <span>Max 50 files listed</span>
                </div>
              </div>

              {/* Right Column: Code / File Viewer */}
              <div className="lg:col-span-7 border border-[#252320] rounded-xl bg-[#181715] text-[#faf9f5] p-4 flex flex-col justify-between overflow-hidden">
                {loadingFile ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-xs font-mono text-[#8e8b82] gap-2">
                    <RefreshCw size={18} className="animate-spin text-[#cc785c]" />
                    <span>Loading file contents from GitHub...</span>
                  </div>
                ) : selectedFile ? (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between pb-3 border-b border-[#252320] text-xs font-mono text-[#a09d96]">
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={14} className="text-[#cc785c]" />
                        <span className="text-[#faf9f5] font-bold truncate">{selectedFile.path}</span>
                      </div>
                      <span>{selectedFile.size} bytes</span>
                    </div>

                    <div className="flex-1 max-h-[340px] overflow-y-auto mt-3 font-mono text-xs text-[#faf9f5] bg-[#1f1e1b] p-3 rounded-lg border border-[#252320]">
                      <pre className="whitespace-pre-wrap leading-relaxed">
                        {selectedFile.content}
                      </pre>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#252320] flex items-center justify-between text-[10px] font-mono text-[#8e8b82]">
                      <span>Read-Only Preview Mode</span>
                      <span className="text-emerald-400">Verified GitHub API Payload</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center text-xs font-sans text-[#8e8b82] space-y-2">
                    <FileCode size={28} className="text-[#cc785c]/60 mx-auto" />
                    <p className="font-serif text-base text-[#faf9f5]">Select a file from the tree</p>
                    <p className="max-w-xs text-[11px] text-[#8e8b82]">
                      Click any file on the left to securely preview its contents via GitHub REST API.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CONNECT GITHUB MODAL */}
        {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border border-[#e6dfd8] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd8]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#141413] text-white flex items-center justify-center font-bold text-xs">
                    GH
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#141413]">Connect GitHub Repository</h3>
                    <p className="text-[11px] text-[#8e8b82] font-mono">Scoped to: {activeBusiness?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsConnectModalOpen(false)}
                  className="p-1 rounded-lg text-[#8e8b82] hover:text-[#141413] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Step 1: Token / App Auth */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-[#141413] uppercase">
                  1. GitHub Token (Read-Only)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={gitHubToken}
                    onChange={(e) => setGitHubToken(e.target.value)}
                    placeholder="ghp_... or GitHub App Token"
                    className="flex-1 h-9 px-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                  />
                  <Button
                    size="sm"
                    onClick={handleFetchRepos}
                    disabled={loadingRepos}
                    className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold"
                  >
                    {loadingRepos ? <RefreshCw size={13} className="animate-spin text-[#cc785c]" /> : 'Fetch Repos'}
                  </Button>
                </div>
                <p className="text-[10px] text-[#8e8b82] font-sans">
                  Requires <span className="font-mono font-bold">repo (read)</span> permission. Credentials are never sent to third-party servers.
                </p>
              </div>

              {/* Step 2: Select Repository */}
              {repositories.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-[#141413] uppercase">
                    2. Select Repository ({repositories.length} found)
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-[#e6dfd8] rounded-xl divide-y divide-[#e6dfd8] bg-[#faf9f5]">
                    {repositories.map((repo) => {
                      const isSelected = selectedRepo?.id === repo.id;
                      return (
                        <button
                          key={repo.id}
                          onClick={() => handleSelectRepo(repo)}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#efe9de] text-[#141413] font-bold' : 'hover:bg-[#efe9de]/50 text-[#6c6a64]'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-mono font-bold text-[#141413]">{repo.fullName}</span>
                            {repo.description && (
                              <p className="text-[10px] text-[#8e8b82] truncate font-sans">{repo.description}</p>
                            )}
                          </div>
                          {isSelected && <CheckCircle2 size={14} className="text-[#cc785c] shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Select Branch */}
              {selectedRepo && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-[#141413] uppercase">
                    3. Select Default Branch
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full h-9 px-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                  >
                    {branches.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name} {b.isProtected ? '(protected)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#e6dfd8] flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveConnection}
                  disabled={!selectedRepo || savingConnection}
                  className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center gap-1.5"
                >
                  {savingConnection ? <RefreshCw size={13} className="animate-spin text-[#cc785c]" /> : <CheckCircle2 size={13} className="text-[#cc785c]" />}
                  <span>Save Connection</span>
                </Button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
