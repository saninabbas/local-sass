import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getBusiness, updateProfile } from '../../lib/api';
import { User, Mail, Calendar, Shield, Building, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Account() {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState<string>('Loading...');
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentPlan = (user as any)?.subscription_status || 'free';
  const joinDate = (user as any)?.created_at ? new Date((user as any).created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently joined';

  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name);
    }
    const loadBusiness = async () => {
      try {
        const data = await getBusiness();
        if (data && data.name) {
          setBusinessName(data.name);
        } else {
          setBusinessName('No business configured');
        }
      } catch (err) {
        setBusinessName('Failed to load');
      }
    };
    loadBusiness();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      await updateProfile({ name: profileName });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      // Let it disappear
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Overview</h1>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${
            message.type === 'success' ? 'bg-success/10 text-success-dark border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-primary" size={24} />
                Personal Information
              </h2>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-100 bg-gray-50 text-gray-500 rounded-xl cursor-not-allowed"
                  />
                  <p className="text-xs text-secondary mt-1">Email cannot be changed.</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setProfileName(user?.name || ''); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase">
                    {profileName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{profileName}</h3>
                    <div className="flex items-center gap-2 text-secondary text-sm mt-1">
                      <Mail size={14} />
                      {user?.email}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-secondary text-sm border-t border-gray-50 pt-6">
                  <Calendar size={16} />
                  Member since {joinDate}
                </div>
              </div>
            )}
          </div>

          {/* Subscription & Status */}
          <div className="col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Shield className="text-indigo-500" size={20} />
                Account Status
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  currentPlan === 'free' ? 'bg-gray-100 text-gray-600' : 'bg-primary/10 text-primary'
                }`}>
                  {currentPlan} Plan
                </div>
                <span className="text-sm font-medium text-success-dark flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success"></span> Active
                </span>
              </div>
              <p className="text-sm text-secondary mb-4">
                {currentPlan === 'free' 
                  ? 'Upgrade your plan to unlock premium features and advanced competitor analysis.' 
                  : 'You have access to all premium features on the Rankora platform.'}
              </p>
              <a href="/dashboard/settings" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                <CreditCard size={14} /> Manage Subscription
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Building className="text-emerald-500" size={20} />
                Linked Business
              </h2>
              <div className="text-gray-900 font-medium mb-1">{businessName}</div>
              <p className="text-sm text-secondary mb-4">
                This is the primary business connected to your Rankora account.
              </p>
              <a href="/dashboard/settings" className="text-sm font-semibold text-primary hover:underline">
                Edit Business Details
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
