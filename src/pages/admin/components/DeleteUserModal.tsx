import { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { AdminUser } from '../../../types';
import { Button } from '../../../components/ui/Button';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-danger rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">Delete User Account</h3>
              <p className="text-xs text-secondary">Permanent and irreversible action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleDelete} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-danger text-xs rounded-xl">
              {error}
            </div>
          )}

          {isPrimaryAdmin ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed">
              <strong>Protected Account:</strong> This is the primary system administrator account (<span className="font-mono font-bold text-primary">{user.email}</span>) and cannot be deleted.
            </div>
          ) : (
            <>
              <div className="p-4 bg-red-50/70 border border-red-100 rounded-xl text-xs text-secondary space-y-2">
                <p>
                  You are about to permanently delete user <strong className="text-primary">{user.name}</strong> (<span className="text-danger font-mono font-semibold">{user.email}</span>).
                </p>
                <p className="text-danger font-medium">
                  This will immediately cascade and erase all of their businesses ({user.businessCount}), audit records ({user.auditCount}), generated recommendations, backlinks, and sessions.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">
                  Type <strong className="text-danger font-mono">DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-mono"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            {!isPrimaryAdmin && (
              <button
                type="submit"
                disabled={isDeleting || confirmInput.trim().toUpperCase() !== 'DELETE'}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl bg-danger hover:bg-red-600 active:bg-red-700 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
