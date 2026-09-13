import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Globe,
  Mail,
  Twitter,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { useMagazine } from '../../context/MagazineContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Author } from '../../types';
import { AdminConfirmDialog } from './AdminConfirmDialog';

export const AdminAuthors: React.FC = () => {
  const { authors, refreshAll, deleteAuthor } = useMagazine();
  const toast = useToast();

  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        role: role.trim() || 'Contributing Writer',
        avatar: avatar.trim(),
        bio: bio.trim(),
        email: email.trim(),
        twitter: twitter.trim(),
        website: website.trim(),
      };

      if (editingAuthor) {
        await api.updateAuthor(editingAuthor.id, payload);
        toast.success(`Author profile "${name}" updated.`);
      } else {
        await api.createAuthor(payload);
        toast.success(`Author "${name}" added to masthead.`);
      }

      await refreshAll();
      setName('');
      setRole('');
      setBio('');
      setEmail('');
      setTwitter('');
      setWebsite('');
      setEditingAuthor(null);
    } catch (err: any) {
      toast.error('Failed to save author: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!authorToDelete) return;
    setIsDeleting(true);
    const targetName = authorToDelete.name;
    const targetId = authorToDelete.id;

    try {
      if (deleteAuthor) {
        await deleteAuthor(targetId);
      } else {
        await api.deleteAuthor(targetId);
        await refreshAll();
      }
      toast.success(`Author "${targetName}" removed from masthead.`);
      setAuthorToDelete(null);
    } catch (err: any) {
      toast.error('Failed to delete author: ' + (err.message || 'Server error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif-editorial text-3xl font-medium text-[#111110]">
          Editorial Staff & Contributors
        </h1>
        <p className="text-xs font-mono-editorial text-[#6E6A62] mt-0.5">
          Manage writers, essayists, photojournalists, and guest curators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs space-y-4">
            <h2 className="font-serif-editorial text-xl font-medium text-[#111110] flex items-center justify-between border-b border-[#E8E5DF] pb-3">
              <span>{editingAuthor ? 'Edit Author Profile' : 'Add New Contributor'}</span>
              {editingAuthor && (
                <button
                  onClick={() => {
                    setEditingAuthor(null);
                    setName('');
                    setRole('');
                    setBio('');
                  }}
                  className="text-xs text-[#EA580C] hover:underline font-mono-editorial"
                >
                  Cancel
                </button>
              )}
            </h2>

            <form onSubmit={handleSave} className="space-y-3 text-xs font-mono-editorial">
              <div>
                <label className="block text-[#6E6A62] mb-1 font-bold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-[#111110]"
                />
              </div>

              <div>
                <label className="block text-[#6E6A62] mb-1 font-bold">Editorial Role / Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Architecture Critic"
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-[#111110]"
                />
              </div>

              <div>
                <label className="block text-[#6E6A62] mb-1 font-bold">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-[#111110]"
                />
              </div>

              <div>
                <label className="block text-[#6E6A62] mb-1 font-bold">Biography</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short author bio..."
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-[#111110]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#6E6A62] mb-1 font-bold">Twitter / X</label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="@handle"
                    className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-[#111110]"
                  />
                </div>
                <div>
                  <label className="block text-[#6E6A62] mb-1 font-bold">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="author@..."
                    className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-[#111110]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 bg-[#111110] text-white rounded-xs uppercase font-bold hover:bg-[#EA580C] transition-colors disabled:opacity-50"
              >
                {editingAuthor ? 'Update Author' : '+ Save Author'}
              </button>
            </form>
          </div>
        </div>

        {/* Authors List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {authors.map((a) => (
              <div
                key={a.id}
                className="bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={a.avatar}
                    alt={a.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#E8E5DF] shrink-0"
                  />
                  <div>
                    <h3 className="font-serif-editorial font-bold text-base text-[#111110]">
                      {a.name}
                    </h3>
                    <span className="text-xs font-mono-editorial text-[#EA580C] uppercase block">
                      {a.role}
                    </span>
                    <p className="text-xs text-[#6E6A62] font-sans-editorial mt-1 line-clamp-2">
                      {a.bio}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E5DF] flex items-center justify-between">
                  <span className="text-[11px] font-mono-editorial text-[#8E8A81]">
                    ID: {a.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingAuthor(a);
                        setName(a.name);
                        setRole(a.role);
                        setAvatar(a.avatar);
                        setBio(a.bio);
                        setEmail(a.email || '');
                        setTwitter(a.twitter || '');
                        setWebsite(a.website || '');
                      }}
                      className="p-1 text-[#55524B] hover:text-[#111110] bg-[#F9F8F6] rounded-xs"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthorToDelete({ id: a.id, name: a.name })}
                      className="p-1 text-[#DC2626] hover:bg-[#FEE2E2] rounded-xs cursor-pointer transition-colors"
                      title="Delete Author"
                      aria-label={`Delete author ${a.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdminConfirmDialog
        isOpen={Boolean(authorToDelete)}
        title="Remove Editorial Contributor"
        message={
          authorToDelete
            ? `Are you sure you want to delete author "${authorToDelete.name}"? This author will be removed from the editorial masthead and contributor directory.`
            : ''
        }
        confirmLabel="Remove Author"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setAuthorToDelete(null)}
      />
    </div>
  );
};
