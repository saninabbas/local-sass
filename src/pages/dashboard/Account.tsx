import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getBusiness, updateProfile, uploadAvatar, deleteAvatar } from '../../lib/api';
import { User, Mail, Calendar, Shield, Building, CreditCard, Camera, Trash2, RefreshCw, Loader2, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export function Account() {
  const { user, updateUser } = useAuth();
  const [businessName, setBusinessName] = useState<string>('Loading...');
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPlan = user?.subscription_tier === 'pro' 
    ? 'Agency Pro' 
    : user?.subscription_tier === 'growth' 
    ? 'Growth' 
    : 'Starter';
    
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently joined';

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (email && email.trim()) return email.substring(0, 2).toUpperCase();
    return 'U';
  };

  const userInitials = getInitials(profileName || user?.name, user?.email);

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
      const res = await updateProfile({ name: profileName.trim() });
      if (res?.data) {
        updateUser(res.data);
      } else {
        updateUser({ name: profileName.trim() });
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setMessage({ type: 'error', text: 'Invalid file format. Please select a JPG, PNG, or WEBP image.' });
      return;
    }

    // Validate file size (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size exceeds maximum limit of 2 MB.' });
      return;
    }

    setIsUploadingPhoto(true);
    setMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64Data = evt.target?.result as string;
        if (!base64Data) {
          setIsUploadingPhoto(false);
          return;
        }

        try {
          const res = await uploadAvatar(base64Data, file.type);
          if (res?.avatar_url) {
            updateUser({ avatar_url: res.avatar_url });
          } else if (res?.data?.avatar_url) {
            updateUser(res.data);
          }
          setMessage({ type: 'success', text: 'Profile picture uploaded and saved!' });
          setTimeout(() => setMessage(null), 4000);
        } catch (uploadErr: any) {
          setMessage({ type: 'error', text: uploadErr.message || 'Failed to upload profile picture.' });
        } finally {
          setIsUploadingPhoto(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to read image file.' });
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

    setIsUploadingPhoto(true);
    setMessage(null);
    try {
      await deleteAvatar();
      updateUser({ avatar_url: undefined });
      setMessage({ type: 'success', text: 'Profile picture removed.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to remove profile picture.' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413]">Account Profile</h1>
            <p className="text-xs text-[#6c6a64] font-sans mt-1">Manage your identity, profile picture, and organization details.</p>
          </div>
          <Link to="/dashboard/billing">
            <Button variant="outline" size="sm" className="text-xs border-[#e6dfd8] bg-[#faf9f5] text-[#141413]">
              View Plan
            </Button>
          </Link>
        </div>

        {message && (
          <div className={`p-3.5 rounded-xl mb-6 text-xs font-mono font-medium ${
            message.type === 'success' ? 'bg-[#5db872]/15 text-[#2b753e] border border-[#5db872]/30' : 'bg-[#c64545]/15 text-[#c64545] border border-[#c64545]/30'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="col-span-1 lg:col-span-2 bg-[#efe9de] rounded-2xl shadow-xs border border-[#e6dfd8] p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e6dfd8]">
              <h2 className="text-base font-serif font-medium text-[#141413] flex items-center gap-2">
                <User className="text-[#cc785c]" size={18} />
                Profile Details
              </h2>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="text-xs bg-[#faf9f5] border-[#e6dfd8] text-[#141413]">
                  Edit Name
                </Button>
              )}
            </div>

            {/* Profile Avatar Management Section */}
            <div className="mb-6 p-4 rounded-xl bg-[#faf9f5] border border-[#e6dfd8]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative shrink-0">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={profileName || 'Profile Avatar'} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#cc785c]/40 shadow-xs" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#181715] text-[#faf9f5] flex items-center justify-center text-xl font-bold border-2 border-[#252320]">
                      {userInitials}
                    </div>
                  )}

                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#141413] font-bold mb-1">
                    Profile Picture
                  </h3>
                  <p className="text-[11px] text-[#6c6a64] font-sans mb-3">
                    Upload a JPG, PNG or WEBP image. Maximum size 2MB.
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      aria-label="Upload photo"
                    >
                      <Camera size={13} className="text-[#cc785c]" />
                      <span>{user?.avatar_url ? 'Replace Photo' : 'Upload Photo'}</span>
                    </button>

                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/jpeg,image/png,image/webp" 
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {user?.avatar_url && (
                      <button
                        type="button"
                        disabled={isUploadingPhoto}
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#faf9f5] hover:bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                        aria-label="Remove photo"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#6c6a64] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#e6dfd8] bg-[#faf9f5] rounded-lg text-xs text-[#141413] focus:ring-1 focus:ring-[#cc785c] outline-none font-sans"
                    placeholder="Enter your full name"
                    autoFocus
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
                  <p className="text-[10px] text-[#8e8b82] mt-1">Email is permanently linked to your tenant identity.</p>
                </div>
                <div className="flex gap-2.5 pt-2">
                  <Button type="submit" size="sm" disabled={isSaving} className="bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-medium">
                    {isSaving ? 'Saving...' : 'Save Name'}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setIsEditing(false); setProfileName(user?.name || ''); }} className="text-xs border-[#e6dfd8] bg-[#faf9f5] text-[#141413]">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-[#faf9f5] rounded-xl border border-[#e6dfd8]">
                    <span className="text-[10px] font-mono text-[#8e8b82] uppercase block">Full Name</span>
                    <span className="text-xs font-semibold text-[#141413] mt-0.5 block">{profileName || 'Not configured'}</span>
                  </div>
                  <div className="p-3 bg-[#faf9f5] rounded-xl border border-[#e6dfd8]">
                    <span className="text-[10px] font-mono text-[#8e8b82] uppercase block">Email Address</span>
                    <span className="text-xs font-mono text-[#141413] mt-0.5 block truncate">{user?.email || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-[#8e8b82] text-xs font-mono border-t border-[#e6dfd8] pt-4">
                  <Calendar size={14} />
                  Member since {joinDate}
                </div>
              </div>
            )}
          </div>

          {/* Subscription & Organization Sidebar */}
          <div className="col-span-1 space-y-6">
            <div className="bg-[#efe9de] rounded-2xl shadow-xs border border-[#e6dfd8] p-5">
              <h2 className="text-sm font-serif font-medium text-[#141413] flex items-center gap-2 mb-3">
                <Shield className="text-[#cc785c]" size={16} />
                Scorankio Plan
              </h2>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide bg-[#cc785c]/15 text-[#cc785c] border border-[#cc785c]/30">
                  {currentPlan}
                </div>
                <span className="text-xs font-mono text-[#2b753e] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5db872]"></span> Active
                </span>
              </div>
              <p className="text-xs text-[#6c6a64] font-sans mb-4 leading-relaxed">
                Active monthly subscription managed via Polar.sh with verified entitlements.
              </p>
              <Link to="/dashboard/billing" className="text-xs font-medium text-[#cc785c] hover:underline flex items-center gap-1">
                <CreditCard size={12} /> Manage Plan & Invoices &rarr;
              </Link>
            </div>

            <div className="bg-[#efe9de] rounded-2xl shadow-xs border border-[#e6dfd8] p-5">
              <h2 className="text-sm font-serif font-medium text-[#141413] flex items-center gap-2 mb-3">
                <Building className="text-[#5db8a6]" size={16} />
                Active Website
              </h2>
              <div className="text-[#141413] text-xs font-sans font-semibold mb-1">{businessName}</div>
              <p className="text-xs text-[#6c6a64] font-sans mb-3">
                Target domain for continuous SEO diagnostic audits, Geo-grids, and rank tracking.
              </p>
              <Link to="/dashboard/businesses" className="text-xs font-medium text-[#cc785c] hover:underline">
                Manage All Websites &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
