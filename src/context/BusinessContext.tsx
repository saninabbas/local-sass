import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getBusinesses, 
  setActiveWorkspaceBusiness, 
  createWorkspaceWebsite, 
  updateWorkspaceWebsite, 
  deleteWorkspaceWebsite,
  getActiveBusinessId,
  setActiveBusinessId as setLocalActiveBizId
} from '../lib/api';

export interface WorkspaceBusiness {
  id: string;
  user_id: string;
  name: string;
  type?: string;
  city?: string;
  country?: string;
  website_url: string;
  normalized_domain?: string;
  is_default?: number;
  latest_score?: number | null;
  score?: number | null;
  last_audit_time?: string | null;
  last_crawled_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface BusinessContextType {
  businesses: WorkspaceBusiness[];
  activeBusiness: WorkspaceBusiness | null;
  activeBusinessId: string | null;
  planLimit: number;
  websitesUsed: number;
  subscriptionStatus: string;
  isLoading: boolean;
  error: string | null;
  isAddWebsiteOpen: boolean;
  openAddWebsiteModal: () => void;
  closeAddWebsiteModal: () => void;
  refreshBusinesses: () => Promise<void>;
  switchBusiness: (id: string) => Promise<boolean>;
  addWebsite: (data: { name?: string; type?: string; city?: string; country?: string; websiteUrl: string; setAsActive?: boolean }) => Promise<WorkspaceBusiness>;
  updateWebsite: (id: string, data: Partial<WorkspaceBusiness>) => Promise<WorkspaceBusiness>;
  removeWebsite: (id: string) => Promise<boolean>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businesses, setBusinesses] = useState<WorkspaceBusiness[]>([]);
  const [activeBusinessId, setActiveBusinessIdState] = useState<string | null>(() => getActiveBusinessId());
  const [planLimit, setPlanLimit] = useState<number>(1);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddWebsiteOpen, setIsAddWebsiteOpen] = useState<boolean>(false);

  const refreshBusinesses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getBusinesses();
      if (res && res.businesses) {
        const list: WorkspaceBusiness[] = res.businesses;
        setBusinesses(list);
        setPlanLimit(res.planLimit || 1);
        setSubscriptionStatus(res.subscriptionStatus || 'free');

        // Determine active business ID
        let currentId = getActiveBusinessId();
        const exists = list.find(b => b.id === currentId);
        
        if (!exists) {
          const defaultBiz = list.find(b => b.is_default === 1) || list[0] || null;
          currentId = defaultBiz ? defaultBiz.id : null;
          setLocalActiveBizId(currentId);
        }
        
        setActiveBusinessIdState(currentId);
      }
    } catch (err: any) {
      console.warn("Failed to load workspace businesses:", err.message);
      // Non-blocking for unauthenticated states
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBusinesses();
  }, [refreshBusinesses]);

  const switchBusiness = async (id: string): Promise<boolean> => {
    try {
      const target = businesses.find(b => b.id === id);
      if (!target) return false;

      // Update local storage first for fast response
      setLocalActiveBizId(id);
      setActiveBusinessIdState(id);

      // Update backend default
      await setActiveWorkspaceBusiness(id).catch(console.error);

      // Re-fetch businesses silently to sync default status
      getBusinesses().then(res => {
        if (res && res.businesses) setBusinesses(res.businesses);
      }).catch(() => {});

      // Dispatch custom event so active pages can refetch without a hard page reload
      window.dispatchEvent(new CustomEvent('rankora:business_switched', { detail: { businessId: id } }));

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const addWebsite = async (data: { name?: string; type?: string; city?: string; country?: string; websiteUrl: string; setAsActive?: boolean }): Promise<WorkspaceBusiness> => {
    try {
      setIsLoading(true);
      setError(null);
      const createdBiz = await createWorkspaceWebsite(data);
      
      await refreshBusinesses();

      if (data.setAsActive && createdBiz?.id) {
        setLocalActiveBizId(createdBiz.id);
        setActiveBusinessIdState(createdBiz.id);
        window.dispatchEvent(new CustomEvent('rankora:business_switched', { detail: { businessId: createdBiz.id } }));
      }

      return createdBiz;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWebsite = async (id: string, data: Partial<WorkspaceBusiness>): Promise<WorkspaceBusiness> => {
    try {
      const updated = await updateWorkspaceWebsite(id, data);
      await refreshBusinesses();
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeWebsite = async (id: string): Promise<boolean> => {
    try {
      await deleteWorkspaceWebsite(id);
      
      // If we deleted the active business, clear local storage
      if (activeBusinessId === id) {
        setLocalActiveBizId(null);
        setActiveBusinessIdState(null);
      }

      await refreshBusinesses();
      window.dispatchEvent(new CustomEvent('rankora:business_switched', { detail: { businessId: null } }));
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const activeBusiness = businesses.find(b => b.id === activeBusinessId) || (businesses.length > 0 ? businesses[0] : null);

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        activeBusiness,
        activeBusinessId,
        planLimit,
        websitesUsed: businesses.length,
        subscriptionStatus,
        isLoading,
        error,
        isAddWebsiteOpen,
        openAddWebsiteModal: () => setIsAddWebsiteOpen(true),
        closeAddWebsiteModal: () => setIsAddWebsiteOpen(false),
        refreshBusinesses,
        switchBusiness,
        addWebsite,
        updateWebsite,
        removeWebsite,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
