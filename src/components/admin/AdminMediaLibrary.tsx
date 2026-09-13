import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Search,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  Globe,
  Edit2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { MediaItem } from '../../types';
import { AdminConfirmDialog } from './AdminConfirmDialog';

interface AdminMediaLibraryProps {
  onSelectMedia?: (url: string) => void;
}

export const AdminMediaLibrary: React.FC<AdminMediaLibraryProps> = ({ onSelectMedia }) => {
  const toast = useToast();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload modal / form state
  const [isUploading, setIsUploading] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [externalAlt, setExternalAlt] = useState('');
  const [externalCaption, setExternalCaption] = useState('');
  const [externalCredit, setExternalCredit] = useState('');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');

  const [selectedMediaForEdit, setSelectedMediaForEdit] = useState<MediaItem | null>(null);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const items = await api.getMedia();
      setMediaList(items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await api.uploadMediaFile(file, {
        alt: externalAlt,
        caption: externalCaption,
        credit: externalCredit,
      });
      await loadMedia();
      setExternalAlt('');
      setExternalCaption('');
      setExternalCredit('');
      // Reset input
      e.target.value = '';
      toast.success('Media asset uploaded successfully.');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddExternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl.trim()) return;
    setIsUploading(true);
    try {
      await api.addExternalMedia({
        url: externalUrl.trim(),
        alt: externalAlt,
        caption: externalCaption,
        credit: externalCredit,
      });
      await loadMedia();
      setExternalUrl('');
      setExternalAlt('');
      setExternalCaption('');
      setExternalCredit('');
      toast.success('External media added to library.');
    } catch (err: any) {
      toast.error('Failed to add external URL: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Media URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleConfirmDelete = async () => {
    if (!mediaToDelete) return;
    setIsDeleting(true);
    const targetId = mediaToDelete.id;
    try {
      await api.deleteMedia(targetId);
      setMediaList((prev) => prev.filter((m) => m.id !== targetId));
      if (selectedMediaForEdit?.id === targetId) {
        setSelectedMediaForEdit(null);
      }
      toast.success('Media asset deleted.');
      setMediaToDelete(null);
    } catch (err: any) {
      toast.error('Delete failed: ' + (err.message || 'Server error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedMediaForEdit) return;
    try {
      const updated = await api.updateMedia(selectedMediaForEdit.id, {
        alt: selectedMediaForEdit.alt,
        caption: selectedMediaForEdit.caption,
        credit: selectedMediaForEdit.credit,
        sourceUrl: selectedMediaForEdit.sourceUrl,
      });
      setMediaList((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      setSelectedMediaForEdit(null);
      toast.success('Media metadata updated.');
    } catch (err: any) {
      toast.error('Update failed: ' + err.message);
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.filename && m.filename.toLowerCase().includes(q)) ||
      (m.alt && m.alt.toLowerCase().includes(q)) ||
      (m.caption && m.caption.toLowerCase().includes(q)) ||
      (m.credit && m.credit.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-editorial text-3xl font-medium text-[#111110]">
            Editorial Media Library
          </h1>
          <p className="text-xs font-mono-editorial text-[#6E6A62] mt-0.5">
            Centralized archive for high-resolution images, archival documents, and photography.
          </p>
        </div>
      </div>

      {/* Upload & Add Asset Card */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
          <span className="text-xs font-mono-editorial uppercase font-bold text-[#111110] flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#EA580C]" /> Add New Editorial Asset
          </span>

          <div className="flex items-center bg-[#F9F8F6] border border-[#E8E5DF] p-0.5 rounded-xs text-xs font-mono-editorial">
            <button
              onClick={() => setUploadMode('upload')}
              className={`px-3 py-1 rounded-xs transition-colors ${
                uploadMode === 'upload' ? 'bg-[#EA580C] text-white font-bold' : 'text-[#6E6A62]'
              }`}
            >
              Upload Local File
            </button>
            <button
              onClick={() => setUploadMode('url')}
              className={`px-3 py-1 rounded-xs transition-colors ${
                uploadMode === 'url' ? 'bg-[#EA580C] text-white font-bold' : 'text-[#6E6A62]'
              }`}
            >
              Add External Image URL
            </button>
          </div>
        </div>

        {uploadMode === 'upload' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-6">
              <label className="block text-xs font-mono-editorial uppercase text-[#6E6A62] mb-1 font-semibold">
                Select Photo File (JPEG, PNG, WebP)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="w-full text-xs font-mono-editorial file:mr-4 file:py-2.5 file:px-4 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-[#111110] file:text-white hover:file:bg-[#EA580C] cursor-pointer"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-mono-editorial uppercase text-[#6E6A62] mb-1 font-semibold">
                Photographer / Credit
              </label>
              <input
                type="text"
                value={externalCredit}
                onChange={(e) => setExternalCredit(e.target.value)}
                placeholder="e.g. Magnum Photos"
                className="w-full text-xs px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-mono-editorial uppercase text-[#6E6A62] mb-1 font-semibold">
                Alt Description
              </label>
              <input
                type="text"
                value={externalAlt}
                onChange={(e) => setExternalAlt(e.target.value)}
                placeholder="Descriptive text..."
                className="w-full text-xs px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleAddExternal} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs font-mono-editorial uppercase text-[#6E6A62] mb-1 font-semibold">
                Image Web URL *
              </label>
              <input
                type="url"
                required
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs font-mono-editorial px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-mono-editorial uppercase text-[#6E6A62] mb-1 font-semibold">
                Photographer / Credit
              </label>
              <input
                type="text"
                value={externalCredit}
                onChange={(e) => setExternalCredit(e.target.value)}
                placeholder="Photo Credit"
                className="w-full text-xs px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono-editorial uppercase text-[#6E6A62] mb-1 font-semibold">
                Alt Text
              </label>
              <input
                type="text"
                value={externalAlt}
                onChange={(e) => setExternalAlt(e.target.value)}
                placeholder="Alt description"
                className="w-full text-xs px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isUploading || !externalUrl.trim()}
                className="w-full py-2 bg-[#EA580C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#C2410C] transition-colors disabled:opacity-50"
              >
                Add URL
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Search and Media Grid */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8A81]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets by filename, credit, caption..."
              className="w-full pl-9 pr-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110]"
            />
          </div>

          <span className="text-xs font-mono-editorial text-[#6E6A62]">
            {filteredMedia.length} assets available
          </span>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs overflow-hidden hover:border-[#EA580C] transition-all flex flex-col justify-between"
            >
              <div className="aspect-square relative overflow-hidden bg-[#E8E5DF]">
                <img
                  src={item.url}
                  alt={item.alt || item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={() => handleCopy(item.url, item.id)}
                    className="p-1.5 bg-white text-[#111110] rounded-xs hover:bg-[#EA580C] hover:text-white transition-colors"
                    title="Copy Image URL"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setSelectedMediaForEdit(item)}
                    className="p-1.5 bg-white text-[#111110] rounded-xs hover:bg-[#EA580C] hover:text-white transition-colors"
                    title="Edit Metadata"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaToDelete(item)}
                    className="p-1.5 bg-white text-[#DC2626] rounded-xs hover:bg-[#DC2626] hover:text-white transition-colors cursor-pointer"
                    title="Delete Asset"
                    aria-label={`Delete media asset ${item.filename}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {onSelectMedia && (
                    <button
                      onClick={() => onSelectMedia(item.url)}
                      className="p-1.5 bg-[#EA580C] text-white rounded-xs text-[10px] uppercase font-bold"
                    >
                      Use
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2 text-[11px] font-mono-editorial text-[#6E6A62] truncate">
                <div className="truncate font-semibold text-[#111110]">{item.filename}</div>
                {item.credit && <div className="truncate text-[#8E8A81]">{item.credit}</div>}
              </div>
            </div>
          ))}
        </div>

        {filteredMedia.length === 0 && (
          <div className="py-16 text-center text-[#8E8A81]">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-[#D4CEBF]" />
            <p className="font-serif-editorial text-lg text-[#111110]">No media assets found</p>
          </div>
        )}
      </div>

      {/* Edit Metadata Modal */}
      {selectedMediaForEdit && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif-editorial text-xl font-medium text-[#111110]">
              Edit Asset Metadata
            </h3>

            <div className="aspect-[16/9] max-h-40 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs overflow-hidden">
              <img src={selectedMediaForEdit.url} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="space-y-3 text-xs font-mono-editorial">
              <div>
                <label className="block text-[#6E6A62] mb-1">Alt Text (Accessibility)</label>
                <input
                  type="text"
                  value={selectedMediaForEdit.alt || ''}
                  onChange={(e) =>
                    setSelectedMediaForEdit({ ...selectedMediaForEdit, alt: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[#6E6A62] mb-1">Caption</label>
                <input
                  type="text"
                  value={selectedMediaForEdit.caption || ''}
                  onChange={(e) =>
                    setSelectedMediaForEdit({ ...selectedMediaForEdit, caption: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[#6E6A62] mb-1">Photographer / Credit</label>
                <input
                  type="text"
                  value={selectedMediaForEdit.credit || ''}
                  onChange={(e) =>
                    setSelectedMediaForEdit({ ...selectedMediaForEdit, credit: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
                />
              </div>

              <div>
                <label className="block text-[#6E6A62] mb-1">Source URL</label>
                <input
                  type="url"
                  value={selectedMediaForEdit.sourceUrl || ''}
                  onChange={(e) =>
                    setSelectedMediaForEdit({ ...selectedMediaForEdit, sourceUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E5DF]">
              <button
                onClick={() => setSelectedMediaForEdit(null)}
                className="px-4 py-2 bg-[#F9F8F6] text-[#55524B] text-xs uppercase font-bold rounded-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#EA580C] text-white text-xs uppercase font-bold rounded-xs hover:bg-[#C2410C]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminConfirmDialog
        isOpen={Boolean(mediaToDelete)}
        title="Delete Media Asset"
        message={
          mediaToDelete
            ? `Are you sure you want to permanently delete media asset "${mediaToDelete.filename}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Asset"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setMediaToDelete(null)}
      />
    </div>
  );
};
