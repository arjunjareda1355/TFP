import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Merge,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useMagazine } from '../../context/MagazineContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { CategoryInfo } from '../../types';
import { AdminConfirmDialog } from './AdminConfirmDialog';

export const AdminCategoriesTags: React.FC = () => {
  const { categories, refreshAll } = useMagazine();
  const toast = useToast();
  const [tagsList, setTagsList] = useState<{ name: string; count: number }[]>([]);

  // New Category State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [accentColor, setAccentColor] = useState('#EA580C');
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);

  // Tag Merge/Rename State
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');

  // Confirm delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'tag'; id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTags = async () => {
    try {
      const t = await api.getTags();
      setTagsList(t);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const payload = {
        name: name.trim(),
        slug: (slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, ''),
        tagline: tagline.trim() || 'Curated dispatches and discoveries.',
        description: description.trim() || `Inquiries into ${name}.`,
        accentColor,
        iconName: 'Compass',
      };

      if (editingCategory) {
        await api.updateCategory(editingCategory.id, payload);
      } else {
        await api.createCategory(payload);
      }

      await refreshAll();
      setName('');
      setSlug('');
      setTagline('');
      setDescription('');
      setEditingCategory(null);
      toast.success(`Category "${name}" saved.`);
    } catch (err: any) {
      toast.error('Failed to save category: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'category') {
        await api.deleteCategory(deleteTarget.id);
        await refreshAll();
        toast.success(`Category "${deleteTarget.name}" deleted.`);
      } else {
        await api.deleteTag(deleteTarget.id);
        setTagsList((prev) => prev.filter((t) => t.name !== deleteTarget.id));
        await refreshAll();
        toast.success(`Tag #${deleteTarget.name} deleted.`);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Delete failed: ' + (err.message || 'Server error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameTag = async () => {
    if (!selectedTag || !newTagName.trim()) return;
    try {
      const res = await api.renameOrMergeTag(selectedTag, newTagName.trim());
      setTagsList(res.tags);
      setSelectedTag(null);
      setNewTagName('');
      await refreshAll();
      toast.success(`Tag updated to #${newTagName.trim()}`);
    } catch (err: any) {
      toast.error('Failed to rename tag: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif-editorial text-3xl font-medium text-[#111110]">
          Taxonomy & Topic Architecture
        </h1>
        <p className="text-xs font-mono-editorial text-[#6E6A62] mt-0.5">
          Curate the primary editorial categories, descriptions, and article reader tags.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Categories Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs space-y-4">
            <h2 className="font-serif-editorial text-xl font-medium text-[#111110] flex items-center justify-between border-b border-[#E8E5DF] pb-3">
              <span>{editingCategory ? 'Edit Category' : 'Create New Category'}</span>
              {editingCategory && (
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setName('');
                    setSlug('');
                    setTagline('');
                    setDescription('');
                  }}
                  className="text-xs text-[#EA580C] hover:underline font-mono-editorial"
                >
                  Cancel Edit
                </button>
              )}
            </h2>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs font-mono-editorial">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6E6A62] mb-1 font-bold">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingCategory && !slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="e.g. Architecture"
                    className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-[#111110]"
                  />
                </div>

                <div>
                  <label className="block text-[#6E6A62] mb-1 font-bold">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. architecture"
                    className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-[#111110]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6E6A62] mb-1 font-bold">Editorial Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Inquiries into structural form, memory, and spatial craft."
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-[#111110]"
                />
              </div>

              <div>
                <label className="block text-[#6E6A62] mb-1 font-bold">Long Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed editorial scope of this category..."
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-[#111110]"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 bg-[#111110] text-white rounded-xs uppercase font-bold text-xs hover:bg-[#EA580C] transition-colors"
              >
                {editingCategory ? 'Update Category' : '+ Add Category'}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F9F8F6] border-b border-[#E8E5DF] font-mono-editorial text-xs font-bold uppercase text-[#6E6A62]">
              Active Publication Categories ({categories.length})
            </div>
            <div className="divide-y divide-[#E8E5DF]">
              {categories.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-[#FAF9F6] transition-colors">
                  <div>
                    <div className="font-serif-editorial text-base font-bold text-[#111110]">
                      {c.name}
                    </div>
                    <div className="text-xs text-[#6E6A62] font-mono-editorial italic">
                      "{c.tagline}"
                    </div>
                    <div className="text-[11px] text-[#8E8A81] font-mono-editorial mt-0.5">
                      /{c.slug}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(c);
                        setName(c.name);
                        setSlug(c.slug);
                        setTagline(c.tagline);
                        setDescription(c.description);
                      }}
                      className="p-1.5 text-[#55524B] hover:text-[#111110] bg-[#F9F8F6] rounded-xs"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ type: 'category', id: c.id, name: c.name })}
                      className="p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded-xs cursor-pointer transition-colors"
                      title="Delete Category"
                      aria-label={`Delete category ${c.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs space-y-4">
            <h2 className="font-serif-editorial text-xl font-medium text-[#111110] border-b border-[#E8E5DF] pb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#EA580C]" /> Article Tags Index
            </h2>

            {selectedTag && (
              <div className="p-3 bg-[#FFF7ED] border border-[#FED7AA] rounded-xs space-y-2 text-xs font-mono-editorial">
                <span className="font-bold text-[#9A3412]">
                  Rename or Merge #{selectedTag}
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="New tag name..."
                    className="flex-1 px-2.5 py-1.5 bg-white border border-[#E8E5DF] rounded-xs"
                  />
                  <button
                    onClick={handleRenameTag}
                    className="px-3 py-1.5 bg-[#EA580C] text-white rounded-xs font-bold"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="px-2 py-1.5 bg-gray-200 text-gray-700 rounded-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 max-h-[500px] overflow-y-auto">
              {tagsList.map((tag) => (
                <div
                  key={tag.name}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs font-mono-editorial text-[#111110] hover:border-[#EA580C]"
                >
                  <span
                    onClick={() => {
                      setSelectedTag(tag.name);
                      setNewTagName(tag.name);
                    }}
                    className="cursor-pointer font-semibold"
                  >
                    #{tag.name} <span className="text-[#8E8A81]">({tag.count})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ type: 'tag', id: tag.name, name: tag.name })}
                    className="text-[#8E8A81] hover:text-[#DC2626] ml-1 cursor-pointer"
                    title={`Delete tag #${tag.name}`}
                    aria-label={`Delete tag #${tag.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}

              {tagsList.length === 0 && (
                <div className="text-xs text-[#8E8A81] py-8 text-center w-full">
                  No tags recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.type === 'category' ? 'Delete Category' : 'Delete Article Tag'}
        message={
          deleteTarget
            ? deleteTarget.type === 'category'
              ? `Are you sure you want to delete category "${deleteTarget.name}"? Articles in this category will remain, but the category section will be removed.`
              : `Are you sure you want to delete tag #${deleteTarget.name} from all articles?`
            : ''
        }
        confirmLabel={deleteTarget?.type === 'category' ? 'Delete Category' : 'Delete Tag'}
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
