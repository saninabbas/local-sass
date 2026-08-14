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
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] mb-6">Account Overview</h1>

        {message && (
          <div className={`p-3.5 rounded-xl mb-6 text-xs font-mono font-medium ${
            message.type === 'success' ? 'bg-[#5db872]/15 text-[#2b753e] border border-[#5db872]/30' : 'bg-[#c64545]/15 text-[#c64545] border border-[#c64545]/30'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="col-span-1 md:col-span-2 bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-serif font-medium text-[#141413] flex items-center gap-2">
                <User className="text-[#cc785c]" size={18} />
                Personal Information
              </h2>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="text-xs bg-[#faf9f5] border-[#e6dfd8] text-[#141413]">
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#6c6a64] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#e6dfd8] bg-[#faf9f5] rounded-lg text-xs text-[#141413] focus:ring-1 focus:ring-[#cc785c] outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#6c6a64] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3.5 py-2 border border-[#e6dfd8] bg-[#e8e0d2] text-[#8e8b82] rounded-lg text-xs font-mono cursor-not-allowed"
                  />
                  <p className="text-[10px] text-[#8e8b82] mt-1">Email is tied to your account identity.</p>
                </div>
                <div className="flex gap-2.5 pt-2">
                  <Button type="submit" size="sm" disabled={isSaving} className="bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-medium">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setIsEditing(false); setProfileName(user?.name || ''); }} className="text-xs border-[#e6dfd8] bg-[#faf9f5] text-[#141413]">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#181715] flex items-center justify-center text-[#faf9f5] font-serif font-bold text-base shadow-xs border border-[#252320]">
                    {profileName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-sans font-medium text-[#141413]">{profileName}</h3>
                    <div className="flex items-center gap-1.5 text-[#6c6a64] font-mono text-xs mt-0.5">
                      <Mail size={12} />
                      {user?.email}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-[#8e8b82] text-xs font-mono border-t border-[#e6dfd8] pt-4">
                  <Calendar size={14} />
                  Member since {joinDate}
                </div>
              </div>
            )}
          </div>

          {/* Subscription & Status */}
          <div className="col-span-1 space-y-6">
            <div className="bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] p-5">
              <h2 className="text-sm font-serif font-medium text-[#141413] flex items-center gap-2 mb-3">
                <Shield className="text-[#cc785c]" size={16} />
                Account Plan
              </h2>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide bg-[#cc785c]/15 text-[#cc785c] border border-[#cc785c]/30">
                  {currentPlan} Plan
                </div>
                <span className="text-xs font-mono text-[#2b753e] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5db872]"></span> Active
                </span>
              </div>
              <p className="text-xs text-[#6c6a64] font-sans mb-4 leading-relaxed">
                {currentPlan === 'free' 
                  ? 'Upgrade your plan to unlock premium intelligence tools and competitors tracking.' 
                  : 'You have active access to growth features on the Rankora platform.'}
              </p>
              <a href="/dashboard/settings" className="text-xs font-medium text-[#cc785c] hover:underline flex items-center gap-1">
                <CreditCard size={12} /> Manage Subscription
              </a>
            </div>

            <div className="bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] p-5">
              <h2 className="text-sm font-serif font-medium text-[#141413] flex items-center gap-2 mb-3">
                <Building className="text-[#5db8a6]" size={16} />
                Linked Business
              </h2>
              <div className="text-[#141413] text-xs font-sans font-medium mb-1">{businessName}</div>
              <p className="text-xs text-[#6c6a64] font-sans mb-3">
                Primary organization profile for continuous ranking evaluations.
              </p>
              <a href="/dashboard/settings" className="text-xs font-medium text-[#cc785c] hover:underline">
                Edit Business Details
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
