import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useBusiness } from '../../context/BusinessContext';
import { 
  getConnections, 
  saveGitHubConnection, 
  saveWordPressConnection,
  testWordPressConnection,
  getWordPressPages,
  getWordPressPosts,
  saveShopifyConnection,
  testShopifyConnection,
  getShopifyProducts,
  getShopifyPages,
  getShopifyArticles,
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
  ArrowRight,
  Globe,
  Layout,
  FileCheck2,
  ShieldCheck,
  ShoppingBag,
  Tag,
  BookOpen
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Connections: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // GitHub Connection Modal state
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [gitHubToken, setGitHubToken] = useState('');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [savingGitHub, setSavingGitHub] = useState(false);

  // GitHub Repository Explorer state
  const [treeItems, setTreeItems] = useState<any[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string; size: number } | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  // WordPress Connection state
  const [isWpModalOpen, setIsWpModalOpen] = useState(false);
  const [wpUrl, setWpUrl] = useState('');
  const [wpUsername, setWpUsername] = useState('');
  const [wpAppPassword, setWpAppPassword] = useState('');
  const [testingWp, setTestingWp] = useState(false);
  const [wpTestResult, setWpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savingWp, setSavingWp] = useState(false);

  // WordPress Content state
  const [wpPages, setWpPages] = useState<any[]>([]);
  const [wpPosts, setWpPosts] = useState<any[]>([]);
  const [loadingWpData, setLoadingWpData] = useState(false);

  // Shopify Connection state (Phase 4)
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
  const [shopifyDomain, setShopifyDomain] = useState('');
  const [shopifyAccessToken, setShopifyAccessToken] = useState('');
  const [testingShopify, setTestingShopify] = useState(false);
  const [shopifyTestResult, setShopifyTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savingShopify, setSavingShopify] = useState(false);

  // Shopify Content state
  const [shopifyTab, setShopifyTab] = useState<'products' | 'pages' | 'articles'>('products');
  const [shopifyProducts, setShopifyProducts] = useState<any[]>([]);
  const [shopifyPages, setShopifyPages] = useState<any[]>([]);
  const [shopifyArticles, setShopifyArticles] = useState<any[]>([]);
  const [loadingShopifyData, setLoadingShopifyData] = useState(false);

  const activeGitHubConnection = connections.find(c => c.provider === 'github' && c.status === 'CONNECTED');
  const activeWpConnection = connections.find(c => c.provider === 'wordpress' && c.status === 'CONNECTED');
  const activeShopifyConnection = connections.find(c => c.provider === 'shopify' && c.status === 'CONNECTED');

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
    setSelectedFile(null);
    setCurrentPath('');
    setTreeItems([]);
    setWpPages([]);
    setWpPosts([]);
    setShopifyProducts([]);
    setShopifyPages([]);
    setShopifyArticles([]);
    if (activeBusiness?.website_url) {
      const cleanUrl = activeBusiness.website_url.startsWith('http') ? activeBusiness.website_url : `https://${activeBusiness.website_url}`;
      setWpUrl(cleanUrl);
      setShopifyDomain(activeBusiness.website_url.replace(/^https?:\/\//, '').split('/')[0]);
    }
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

  // Fetch WordPress pages/posts when active WP connection is present
  useEffect(() => {
    if (activeWpConnection) {
      loadWordPressContent();
    }
  }, [activeWpConnection?.id]);

  // Fetch Shopify products/pages when active Shopify connection is present
  useEffect(() => {
    if (activeShopifyConnection) {
      loadShopifyContent();
    }
  }, [activeShopifyConnection?.id]);

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

  const loadWordPressContent = async () => {
    try {
      setLoadingWpData(true);
      const [pages, posts] = await Promise.all([
        getWordPressPages(20).catch(() => []),
        getWordPressPosts(20).catch(() => [])
      ]);
      setWpPages(Array.isArray(pages) ? pages : []);
      setWpPosts(Array.isArray(posts) ? posts : []);
    } catch (e) {
      console.warn("Failed to load WP content:", e);
    } finally {
      setLoadingWpData(false);
    }
  };

  const loadShopifyContent = async () => {
    try {
      setLoadingShopifyData(true);
      const [products, pages, articles] = await Promise.all([
        getShopifyProducts(20).catch(() => []),
        getShopifyPages(20).catch(() => []),
        getShopifyArticles(20).catch(() => [])
      ]);
      setShopifyProducts(Array.isArray(products) ? products : []);
      setShopifyPages(Array.isArray(pages) ? pages : []);
      setShopifyArticles(Array.isArray(articles) ? articles : []);
    } catch (e) {
      console.warn("Failed to load Shopify content:", e);
    } finally {
      setLoadingShopifyData(false);
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

  const handleSaveGitHub = async () => {
    if (!selectedRepo) return;
    try {
      setSavingGitHub(true);
      await saveGitHubConnection({
        repositoryName: selectedRepo.name,
        repositoryOwner: selectedRepo.owner,
        repositoryId: selectedRepo.id,
        defaultBranch: selectedBranch,
        token: gitHubToken.trim() || undefined
      });

      setFeedback({ type: 'success', message: `Connected repository ${selectedRepo.owner}/${selectedRepo.name} (${selectedBranch})!` });
      setTimeout(() => setFeedback(null), 4000);
      setIsGitHubModalOpen(false);
      await loadConnections();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save GitHub connection.' });
    } finally {
      setSavingGitHub(false);
    }
  };

  const handleTestWordPress = async () => {
    if (!wpUrl || !wpUsername || !wpAppPassword) {
      setFeedback({ type: 'error', message: "Please fill in Site URL, Username, and Application Password." });
      return;
    }

    try {
      setTestingWp(true);
      setWpTestResult(null);
      const res = await testWordPressConnection({
        siteUrl: wpUrl.trim(),
        username: wpUsername.trim(),
        appPassword: wpAppPassword.trim()
      });

      if (res.success) {
        setWpTestResult({ success: true, message: `Successfully connected to "${res.data?.siteName || res.data?.siteUrl}" as ${res.data?.user?.name}!` });
      } else {
        setWpTestResult({ success: false, message: res.error || 'Connection failed' });
      }
    } catch (err: any) {
      setWpTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setTestingWp(false);
    }
  };

  const handleSaveWordPress = async () => {
    if (!wpUrl || !wpUsername || !wpAppPassword) return;
    try {
      setSavingWp(true);
      await saveWordPressConnection({
        siteUrl: wpUrl.trim(),
        username: wpUsername.trim(),
        appPassword: wpAppPassword.trim()
      });

      setFeedback({ type: 'success', message: `Connected WordPress website successfully!` });
      setTimeout(() => setFeedback(null), 4000);
      setIsWpModalOpen(false);
      await loadConnections();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save WordPress connection.' });
    } finally {
      setSavingWp(false);
    }
  };

  const handleTestShopify = async () => {
    if (!shopifyDomain || !shopifyAccessToken) {
      setFeedback({ type: 'error', message: "Please fill in Shopify Store Domain and Admin Access Token." });
      return;
    }

    try {
      setTestingShopify(true);
      setShopifyTestResult(null);
      const res = await testShopifyConnection({
        shopDomain: shopifyDomain.trim(),
        accessToken: shopifyAccessToken.trim()
      });

      if (res.success) {
        setShopifyTestResult({ success: true, message: `Successfully connected to "${res.data?.store?.name || res.data?.store?.domain}" (${res.data?.store?.currency})!` });
      } else {
        setShopifyTestResult({ success: false, message: res.error || 'Connection failed' });
      }
    } catch (err: any) {
      setShopifyTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setTestingShopify(false);
    }
  };

  const handleSaveShopify = async () => {
    if (!shopifyDomain || !shopifyAccessToken) return;
    try {
      setSavingShopify(true);
      await saveShopifyConnection({
        shopDomain: shopifyDomain.trim(),
        accessToken: shopifyAccessToken.trim()
      });

      setFeedback({ type: 'success', message: `Connected Shopify store successfully!` });
      setTimeout(() => setFeedback(null), 4000);
      setIsShopifyModalOpen(false);
      await loadConnections();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save Shopify connection.' });
    } finally {
      setSavingShopify(false);
    }
  };

  const handleDisconnect = async (connId: string) => {
    if (!window.confirm("Are you sure you want to disconnect this integration from the current project?")) return;
    try {
      await deleteConnection(connId);
      setFeedback({ type: 'success', message: "Connection removed." });
      setTimeout(() => setFeedback(null), 4000);
      setTreeItems([]);
      setSelectedFile(null);
      setWpPages([]);
      setWpPosts([]);
      setShopifyProducts([]);
      setShopifyPages([]);
      setShopifyArticles([]);
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
                Universal Execution Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
              Website Connections & CMS Integrations
            </h1>
            <p className="text-xs text-[#6c6a64] font-sans mt-1">
              Secure, tenant-isolated execution providers for <strong className="text-[#141413]">{activeBusiness?.name || 'Current Project'}</strong> ({activeBusiness?.website_url}).
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
          
          {/* 1. GITHUB */}
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
                Automated Pull Request engine for custom-code web stacks (Next.js, Astro, Remix, static HTML).
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
                    onClick={() => setIsGitHubModalOpen(true)}
                    className="bg-[#faf9f5] border border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de] text-xs font-semibold"
                  >
                    Change Repo
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsGitHubModalOpen(true)}
                  className="w-full bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <GitBranch size={13} className="text-[#cc785c]" />
                  <span>Connect GitHub</span>
                </Button>
              )}
            </div>
          </div>

          {/* 2. WORDPRESS */}
          <div className={`rounded-2xl p-6 border transition-all flex flex-col justify-between ${
            activeWpConnection 
              ? 'bg-white border-[#0073aa]/40 shadow-xs' 
              : 'bg-white border-[#e6dfd8] shadow-2xs hover:border-[#0073aa]/30'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0073aa] text-white flex items-center justify-center font-bold text-sm">
                  WP
                </div>
                {activeWpConnection ? (
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

              <h2 className="text-lg font-serif font-bold text-[#141413] mb-1">WordPress REST API</h2>
              <p className="text-xs text-[#6c6a64] font-sans leading-relaxed mb-4">
                Direct CMS integration via Application Passwords for verified meta tag, H1, and content updates.
              </p>

              {activeWpConnection && (
                <div className="p-3 bg-[#faf9f5] border border-[#e6dfd8] rounded-xl space-y-1.5 mb-4 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8e8b82]">Site:</span>
                    <span className="font-bold text-[#141413] truncate max-w-[160px]">
                      {activeWpConnection.repository_name || activeWpConnection.repository_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8e8b82]">User:</span>
                    <span className="font-bold text-[#0073aa]">{activeWpConnection.repository_owner}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8e8b82]">Cached:</span>
                    <span className="text-[#141413]">{wpPages.length} Pages &bull; {wpPosts.length} Posts</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#e6dfd8]/60 flex items-center justify-between gap-3">
              {activeWpConnection ? (
                <>
                  <button
                    onClick={() => handleDisconnect(activeWpConnection.id)}
                    className="text-xs font-sans font-medium text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Disconnect</span>
                  </button>
                  <Button
                    size="sm"
                    onClick={() => setIsWpModalOpen(true)}
                    className="bg-[#faf9f5] border border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de] text-xs font-semibold"
                  >
                    Update Auth
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsWpModalOpen(true)}
                  className="w-full bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Globe size={13} className="text-[#0073aa]" />
                  <span>Connect WordPress</span>
                </Button>
              )}
            </div>
          </div>

          {/* 3. SHOPIFY (Phase 4 Active) */}
          <div className={`rounded-2xl p-6 border transition-all flex flex-col justify-between ${
            activeShopifyConnection 
              ? 'bg-white border-[#96bf48]/40 shadow-xs' 
              : 'bg-white border-[#e6dfd8] shadow-2xs hover:border-[#96bf48]/30'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#96bf48] text-white flex items-center justify-center font-bold text-sm">
                  SH
                </div>
                {activeShopifyConnection ? (
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

              <h2 className="text-lg font-serif font-bold text-[#141413] mb-1">Shopify Store</h2>
              <p className="text-xs text-[#6c6a64] font-sans leading-relaxed mb-4">
                Admin REST API integration for automated product and page SEO titles, descriptions, and metadata.
              </p>

              {activeShopifyConnection && (
                <div className="p-3 bg-[#faf9f5] border border-[#e6dfd8] rounded-xl space-y-1.5 mb-4 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8e8b82]">Store:</span>
                    <span className="font-bold text-[#141413] truncate max-w-[160px]">
                      {activeShopifyConnection.repository_name || activeShopifyConnection.repository_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8e8b82]">Domain:</span>
                    <span className="font-bold text-[#5e8e3e] truncate max-w-[160px]">{activeShopifyConnection.repository_id}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8e8b82]">Cached:</span>
                    <span className="text-[#141413]">{shopifyProducts.length} Prods &bull; {shopifyPages.length} Pages</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#e6dfd8]/60 flex items-center justify-between gap-3">
              {activeShopifyConnection ? (
                <>
                  <button
                    onClick={() => handleDisconnect(activeShopifyConnection.id)}
                    className="text-xs font-sans font-medium text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Disconnect</span>
                  </button>
                  <Button
                    size="sm"
                    onClick={() => setIsShopifyModalOpen(true)}
                    className="bg-[#faf9f5] border border-[#e6dfd8] text-[#141413] hover:bg-[#efe9de] text-xs font-semibold"
                  >
                    Update Auth
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsShopifyModalOpen(true)}
                  className="w-full bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={13} className="text-[#96bf48]" />
                  <span>Connect Shopify</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* SHOPIFY CONTENT EXPLORER (PHASE 4) */}
        {activeShopifyConnection && (
          <div className="rounded-2xl border border-[#e6dfd8] bg-white p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6dfd8]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8b82] block mb-1">
                  Connected Shopify Store
                </span>
                <h2 className="text-xl font-serif font-bold text-[#141413] flex items-center gap-2">
                  <span>{activeShopifyConnection.repository_name || 'Shopify Store'}</span>
                  <span className="font-mono text-xs font-normal text-[#5e8e3e]">
                    ({activeShopifyConnection.repository_id})
                  </span>
                </h2>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-[#efe9de] p-1 rounded-xl">
                <button
                  onClick={() => setShopifyTab('products')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                    shopifyTab === 'products' ? 'bg-[#141413] text-white font-bold' : 'text-[#6c6a64] hover:text-[#141413]'
                  }`}
                >
                  Products ({shopifyProducts.length})
                </button>
                <button
                  onClick={() => setShopifyTab('pages')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                    shopifyTab === 'pages' ? 'bg-[#141413] text-white font-bold' : 'text-[#6c6a64] hover:text-[#141413]'
                  }`}
                >
                  Pages ({shopifyPages.length})
                </button>
                <button
                  onClick={() => setShopifyTab('articles')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                    shopifyTab === 'articles' ? 'bg-[#141413] text-white font-bold' : 'text-[#6c6a64] hover:text-[#141413]'
                  }`}
                >
                  Articles ({shopifyArticles.length})
                </button>
              </div>
            </div>

            {loadingShopifyData ? (
              <div className="py-8 text-center text-xs font-mono text-[#8e8b82]">
                <RefreshCw size={14} className="animate-spin inline mr-1 text-[#5e8e3e]" /> Loading Shopify store content...
              </div>
            ) : shopifyTab === 'products' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {shopifyProducts.length === 0 ? (
                  <p className="col-span-3 text-xs text-[#8e8b82] py-4 text-center">No products found in this Shopify store.</p>
                ) : (
                  shopifyProducts.map((prod) => (
                    <div key={prod.id} className="p-3 bg-[#faf9f5] rounded-xl border border-[#e6dfd8] space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#141413] truncate block max-w-[200px]">{prod.title}</span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {prod.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8e8b82] font-mono truncate">{prod.handle}</p>
                    </div>
                  ))
                )}
              </div>
            ) : shopifyTab === 'pages' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {shopifyPages.length === 0 ? (
                  <p className="col-span-3 text-xs text-[#8e8b82] py-4 text-center">No custom pages found.</p>
                ) : (
                  shopifyPages.map((page) => (
                    <div key={page.id} className="p-3 bg-[#faf9f5] rounded-xl border border-[#e6dfd8] space-y-1 text-xs">
                      <span className="font-bold text-[#141413] truncate block">{page.title}</span>
                      <p className="text-[11px] text-[#8e8b82] font-mono truncate">/{page.handle}</p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {shopifyArticles.length === 0 ? (
                  <p className="col-span-3 text-xs text-[#8e8b82] py-4 text-center">No blog articles found.</p>
                ) : (
                  shopifyArticles.map((art) => (
                    <div key={art.id} className="p-3 bg-[#faf9f5] rounded-xl border border-[#e6dfd8] space-y-1 text-xs">
                      <span className="font-bold text-[#141413] truncate block">{art.title}</span>
                      <p className="text-[11px] text-[#8e8b82] font-mono truncate">{art.handle}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* WORDPRESS CONTENT EXPLORER */}
        {activeWpConnection && (
          <div className="rounded-2xl border border-[#e6dfd8] bg-white p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6dfd8]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8b82] block mb-1">
                  Connected WordPress Site
                </span>
                <h2 className="text-xl font-serif font-bold text-[#141413] flex items-center gap-2">
                  <span>{activeWpConnection.repository_name || 'WordPress Site'}</span>
                  <span className="font-mono text-xs font-normal text-[#0073aa]">
                    ({activeWpConnection.repository_id})
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#8e8b82]">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>REST API Status: Connected</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-[#e6dfd8] rounded-xl bg-[#faf9f5] p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#e6dfd8] text-xs font-mono font-bold text-[#141413]">
                  <div className="flex items-center gap-2">
                    <Layout size={14} className="text-[#0073aa]" />
                    <span>Pages ({wpPages.length})</span>
                  </div>
                </div>

                {loadingWpData ? (
                  <div className="py-8 text-center text-xs font-mono text-[#8e8b82]">
                    <RefreshCw size={14} className="animate-spin inline mr-1 text-[#0073aa]" /> Loading pages...
                  </div>
                ) : wpPages.length === 0 ? (
                  <p className="text-xs text-[#8e8b82] py-4 text-center">No published pages found.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                    {wpPages.map((page) => (
                      <div key={page.id} className="p-2 bg-white rounded-lg border border-[#e6dfd8] flex items-center justify-between">
                        <div className="truncate pr-2">
                          <span className="font-bold text-[#141413] block truncate">{page.title?.rendered || 'Untitled'}</span>
                          <span className="text-[10px] text-[#8e8b82] font-mono truncate block">{page.slug}</span>
                        </div>
                        <a href={page.link} target="_blank" rel="noreferrer" className="text-[#8e8b82] hover:text-[#0073aa] shrink-0">
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-[#e6dfd8] rounded-xl bg-[#faf9f5] p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#e6dfd8] text-xs font-mono font-bold text-[#141413]">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-[#0073aa]" />
                    <span>Posts ({wpPosts.length})</span>
                  </div>
                </div>

                {loadingWpData ? (
                  <div className="py-8 text-center text-xs font-mono text-[#8e8b82]">
                    <RefreshCw size={14} className="animate-spin inline mr-1 text-[#0073aa]" /> Loading posts...
                  </div>
                ) : wpPosts.length === 0 ? (
                  <p className="text-xs text-[#8e8b82] py-4 text-center">No published posts found.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                    {wpPosts.map((post) => (
                      <div key={post.id} className="p-2 bg-white rounded-lg border border-[#e6dfd8] flex items-center justify-between">
                        <div className="truncate pr-2">
                          <span className="font-bold text-[#141413] block truncate">{post.title?.rendered || 'Untitled'}</span>
                          <span className="text-[10px] text-[#8e8b82] font-mono truncate block">{post.slug}</span>
                        </div>
                        <a href={post.link} target="_blank" rel="noreferrer" className="text-[#8e8b82] hover:text-[#0073aa] shrink-0">
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GITHUB REPOSITORY EXPLORER */}
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[420px]">
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
        {isGitHubModalOpen && (
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
                <button onClick={() => setIsGitHubModalOpen(false)} className="p-1 rounded-lg text-[#8e8b82] hover:text-[#141413]">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-[#141413] uppercase">1. GitHub Token</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={gitHubToken}
                    onChange={(e) => setGitHubToken(e.target.value)}
                    placeholder="ghp_... or GitHub App Token"
                    className="flex-1 h-9 px-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5]"
                  />
                  <Button size="sm" onClick={handleFetchRepos} disabled={loadingRepos} className="bg-[#141413] text-[#faf9f5] text-xs">
                    {loadingRepos ? <RefreshCw size={13} className="animate-spin text-[#cc785c]" /> : 'Fetch Repos'}
                  </Button>
                </div>
              </div>

              {repositories.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-[#141413] uppercase">2. Select Repository</label>
                  <div className="max-h-40 overflow-y-auto border border-[#e6dfd8] rounded-xl divide-y divide-[#e6dfd8] bg-[#faf9f5]">
                    {repositories.map((repo) => (
                      <button
                        key={repo.id}
                        onClick={() => handleSelectRepo(repo)}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs cursor-pointer ${
                          selectedRepo?.id === repo.id ? 'bg-[#efe9de] text-[#141413] font-bold' : 'hover:bg-[#efe9de]/50'
                        }`}
                      >
                        <span className="font-mono">{repo.fullName}</span>
                        {selectedRepo?.id === repo.id && <CheckCircle2 size={14} className="text-[#cc785c]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedRepo && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-[#141413] uppercase">3. Default Branch</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full h-9 px-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5]"
                  >
                    {branches.map((b) => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-[#e6dfd8] flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsGitHubModalOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSaveGitHub} disabled={!selectedRepo || savingGitHub} className="bg-[#141413] text-[#faf9f5]">
                  {savingGitHub ? <RefreshCw size={13} className="animate-spin text-[#cc785c]" /> : <CheckCircle2 size={13} className="text-[#cc785c]" />}
                  <span>Save Connection</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* CONNECT WORDPRESS MODAL */}
        {isWpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border border-[#e6dfd8] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd8]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0073aa] text-white flex items-center justify-center font-bold text-xs">
                    WP
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#141413]">Connect WordPress Website</h3>
                    <p className="text-[11px] text-[#8e8b82] font-mono">Scoped to: {activeBusiness?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsWpModalOpen(false)} className="p-1 rounded-lg text-[#8e8b82] hover:text-[#141413]">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#141413] uppercase mb-1">
                    WordPress Site URL (HTTPS)
                  </label>
                  <input
                    type="url"
                    value={wpUrl}
                    onChange={(e) => setWpUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full h-9 px-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#141413] uppercase mb-1">
                    WordPress Username
                  </label>
                  <input
                    type="text"
                    value={wpUsername}
                    onChange={(e) => setWpUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full h-9 px-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#141413] uppercase mb-1">
                    Application Password
                  </label>
                  <input
                    type="password"
                    value={wpAppPassword}
                    onChange={(e) => setWpAppPassword(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full h-9 px-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5]"
                  />
                  <p className="text-[10px] text-[#8e8b82] font-sans mt-1">
                    Generate in WordPress Admin &rarr; Users &rarr; Profile &rarr; Application Passwords.
                  </p>
                </div>
              </div>

              {wpTestResult && (
                <div className={`p-3 rounded-xl text-xs font-sans flex items-center gap-2 ${
                  wpTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {wpTestResult.success ? <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> : <AlertCircle size={15} className="text-red-600 shrink-0" />}
                  <span>{wpTestResult.message}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#e6dfd8] flex items-center justify-between">
                <Button size="sm" variant="outline" onClick={handleTestWordPress} disabled={testingWp} className="text-xs font-semibold">
                  {testingWp ? <RefreshCw size={13} className="animate-spin text-[#0073aa]" /> : 'Test Connection'}
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsWpModalOpen(false)}>Cancel</Button>
                  <Button
                    size="sm"
                    onClick={handleSaveWordPress}
                    disabled={savingWp || !wpUrl || !wpUsername || !wpAppPassword}
                    className="bg-[#141413] text-[#faf9f5] text-xs font-semibold"
                  >
                    {savingWp ? <RefreshCw size={13} className="animate-spin text-[#cc785c]" /> : <CheckCircle2 size={13} className="text-[#cc785c]" />}
                    <span>Save & Connect</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONNECT SHOPIFY MODAL (PHASE 4) */}
        {isShopifyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border border-[#e6dfd8] rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd8]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#96bf48] text-white flex items-center justify-center font-bold text-xs">
                    SH
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#141413]">Connect Shopify Store</h3>
                    <p className="text-[11px] text-[#8e8b82] font-mono">Scoped to: {activeBusiness?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsShopifyModalOpen(false)} className="p-1 rounded-lg text-[#8e8b82] hover:text-[#141413]">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#141413] uppercase mb-1">
                    Shopify Store Domain
                  </label>
                  <input
                    type="text"
                    value={shopifyDomain}
                    onChange={(e) => setShopifyDomain(e.target.value)}
                    placeholder="your-store.myshopify.com"
                    className="w-full h-9 px-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5]"
                  />
                  <p className="text-[10px] text-[#8e8b82] font-sans mt-1">
                    Enter your .myshopify.com domain or primary store hostname.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#141413] uppercase mb-1">
                    Admin API Access Token
                  </label>
                  <input
                    type="password"
                    value={shopifyAccessToken}
                    onChange={(e) => setShopifyAccessToken(e.target.value)}
                    placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full h-9 px-3 text-xs font-mono rounded-xl border border-[#e6dfd8] bg-[#faf9f5]"
                  />
                  <p className="text-[10px] text-[#8e8b82] font-sans mt-1">
                    Generate in Shopify Admin &rarr; Settings &rarr; Apps & Sales Channels &rarr; Develop Apps. Requires read_products, write_products, read_content, write_content scopes.
                  </p>
                </div>
              </div>

              {shopifyTestResult && (
                <div className={`p-3 rounded-xl text-xs font-sans flex items-center gap-2 ${
                  shopifyTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {shopifyTestResult.success ? <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> : <AlertCircle size={15} className="text-red-600 shrink-0" />}
                  <span>{shopifyTestResult.message}</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#e6dfd8] flex items-center justify-between">
                <Button size="sm" variant="outline" onClick={handleTestShopify} disabled={testingShopify} className="text-xs font-semibold">
                  {testingShopify ? <RefreshCw size={13} className="animate-spin text-[#5e8e3e]" /> : 'Test Connection'}
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsShopifyModalOpen(false)}>Cancel</Button>
                  <Button
                    size="sm"
                    onClick={handleSaveShopify}
                    disabled={savingShopify || !shopifyDomain || !shopifyAccessToken}
                    className="bg-[#141413] text-[#faf9f5] text-xs font-semibold"
                  >
                    {savingShopify ? <RefreshCw size={13} className="animate-spin text-[#cc785c]" /> : <CheckCircle2 size={13} className="text-[#cc785c]" />}
                    <span>Save & Connect</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
