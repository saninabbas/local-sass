import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { AdminUser } from '../../../types';

interface DeleteUserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (userId: string) => Promise<void>;
}

export function DeleteUserModal({ user, isOpen, onClose, onConfirmDelete }: DeleteUserModalProps) {
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const isPrimaryAdmin = user.email === 'saninabbas@gmail.com';

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput.trim().toLowerCase() !== 'delete') {
      setError("Please type 'DELETE' to confirm.");
      return;
    }

    setError('');
    setIsDeleting(true);
    try {
      await onConfirmDelete(user.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-500/10 text-red-400 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete User Account</h3>
              <p className="text-xs text-slate-400">Permanent and irreversible action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleDelete} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          {isPrimaryAdmin ? (
            <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-xl text-amber-200 text-xs leading-relaxed">
              <strong>Protected Account:</strong> This is the primary system administrator account (<span className="font-mono text-white">{user.email}</span>) and cannot be deleted.
            </div>
          ) : (
            <>
              <div className="p-4 bg-red-950/30 border border-red-900/60 rounded-xl text-xs text-slate-300 space-y-2">
                <p>
                  You are about to permanently delete user <strong className="text-white">{user.name}</strong> (<span className="text-red-400 font-mono">{user.email}</span>).
                </p>
                <p className="text-red-300 font-medium">
                  This will immediately cascade and erase all of their businesses ({user.businessCount}), audit records ({user.auditCount}), generated recommendations, backlinks, and sessions.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Type <strong className="text-red-400 font-mono">DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-mono"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            {!isPrimaryAdmin && (
              <button
                type="submit"
                disabled={isDeleting || confirmInput.trim().toUpperCase() !== 'DELETE'}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 shadow-md shadow-red-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting Data...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Permanently Delete User</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
