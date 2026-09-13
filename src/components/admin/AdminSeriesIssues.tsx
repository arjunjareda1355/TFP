import React, { useState } from 'react';
import {
  BookMarked,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { useMagazine } from '../../context/MagazineContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { EditorialSeries, MagazineIssue } from '../../types';
import { AdminConfirmDialog } from './AdminConfirmDialog';

export const AdminSeriesIssues: React.FC = () => {
  const { series, issues, refreshAll } = useMagazine();
  const toast = useToast();

  // Series state
  const [editingSeries, setEditingSeries] = useState<EditorialSeries | null>(null);
  const [sName, setSName] = useState('');
  const [sTagline, setSTagline] = useState('');
  const [sDescription, setSDescription] = useState('');
  const [sImage, setSImage] = useState('');
  const [sCadence, setSCadence] = useState('Monthly');

  // Issues state
  const [editingIssue, setEditingIssue] = useState<MagazineIssue | null>(null);
  const [iNumber, setINumber] = useState('');
  const [iTitle, setITitle] = useState('');
  const [iTheme, setITheme] = useState('');
  const [iDate, setIDate] = useState('');
  const [iCoverImage, setICoverImage] = useState('');
  const [iCuratorNote, setICuratorNote] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'series' | 'issue'; id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'series') {
        await api.deleteSeries(deleteTarget.id);
        toast.success(`Series "${deleteTarget.name}" deleted.`);
      } else {
        await api.deleteIssue(deleteTarget.id);
        toast.success(`Issue "${deleteTarget.name}" deleted.`);
      }
      await refreshAll();
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message || 'Server error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim()) return;
    try {
      const payload = {
        name: sName.trim(),
        slug: sName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tagline: sTagline.trim(),
        description: sDescription.trim(),
        coverImage: sImage.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
        cadence: sCadence.trim(),
      };
      if (editingSeries) {
        await api.updateSeries(editingSeries.id, payload);
        toast.success(`Series franchise "${sName}" updated.`);
      } else {
        await api.createSeries(payload);
        toast.success(`Series franchise "${sName}" created.`);
      }
      await refreshAll();
      setSName('');
      setSTagline('');
      setSDescription('');
      setSImage('');
      setEditingSeries(null);
    } catch (err: any) {
      toast.error('Failed to save series: ' + err.message);
    }
  };

  const handleSaveIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iTitle.trim() || !iNumber.trim()) return;
    try {
      const payload = {
        number: iNumber.trim(),
        title: iTitle.trim(),
        theme: iTheme.trim(),
        date: iDate.trim() || 'Spring 2026',
        coverImage: iCoverImage.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
        curatorNote: iCuratorNote.trim(),
        articleSlugs: [],
      };
      if (editingIssue) {
        await api.updateIssue(editingIssue.id, payload);
        toast.success(`Issue No. ${iNumber} updated.`);
      } else {
        await api.createIssue(payload);
        toast.success(`Issue No. ${iNumber} created.`);
      }
      await refreshAll();
      setINumber('');
      setITitle('');
      setITheme('');
      setIDate('');
      setICoverImage('');
      setICuratorNote('');
      setEditingIssue(null);
    } catch (err: any) {
      toast.error('Failed to save issue: ' + err.message);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif-editorial text-3xl font-medium text-[#111110]">
          Series & Magazine Issues
        </h1>
        <p className="text-xs font-mono-editorial text-[#6E6A62] mt-0.5">
          Curate recurring editorial franchises (The Fold, The Field Note) and numbered periodicals.
        </p>
      </div>

      {/* 1. EDITORIAL SERIES */}
      <div className="space-y-4">
        <h2 className="font-serif-editorial text-2xl font-medium text-[#111110] border-b border-[#E8E5DF] pb-2">
          1. Editorial Series Franchises
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleSaveSeries} className="lg:col-span-4 bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs space-y-3 text-xs font-mono-editorial">
            <span className="font-bold text-[#111110] block">
              {editingSeries ? 'Edit Series' : 'Add New Series'}
            </span>
            <div>
              <label className="block text-[#6E6A62] mb-1">Series Name *</label>
              <input
                type="text"
                required
                value={sName}
                onChange={(e) => setSName(e.target.value)}
                placeholder="e.g. THE FIELD NOTE"
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
              />
            </div>
            <div>
              <label className="block text-[#6E6A62] mb-1">Tagline</label>
              <input
                type="text"
                value={sTagline}
                onChange={(e) => setSTagline(e.target.value)}
                placeholder="Dispatches from the periphery..."
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
              />
            </div>
            <div>
              <label className="block text-[#6E6A62] mb-1">Cover Photo URL</label>
              <input
                type="url"
                value={sImage}
                onChange={(e) => setSImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#111110] text-white rounded-xs uppercase font-bold hover:bg-[#EA580C]"
            >
              {editingSeries ? 'Update Series' : '+ Add Series'}
            </button>
          </form>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {series.map((s) => (
              <div key={s.id} className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="aspect-[16/9] bg-[#F9F8F6] overflow-hidden">
                  <img src={s.coverImage} alt={s.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-1 flex-1">
                  <span className="text-[10px] font-mono-editorial text-[#EA580C] uppercase font-bold">
                    {s.cadence || 'Series'}
                  </span>
                  <h3 className="font-serif-editorial text-lg font-bold text-[#111110]">
                    {s.name}
                  </h3>
                  <p className="text-xs text-[#6E6A62]">{s.tagline}</p>
                </div>
                <div className="p-3 bg-[#F9F8F6] border-t border-[#E8E5DF] flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingSeries(s);
                      setSName(s.name);
                      setSTagline(s.tagline);
                      setSDescription(s.description || '');
                      setSImage(s.coverImage);
                    }}
                    className="p-1 text-[#55524B] hover:text-[#111110]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ type: 'series', id: s.id, name: s.name })}
                    className="p-1 text-[#DC2626] hover:bg-[#FEE2E2] rounded-xs cursor-pointer transition-colors"
                    title="Delete Series"
                    aria-label={`Delete series ${s.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAGAZINE ISSUES */}
      <div className="space-y-4 pt-6 border-t border-[#E8E5DF]">
        <h2 className="font-serif-editorial text-2xl font-medium text-[#111110] border-b border-[#E8E5DF] pb-2">
          2. Periodical Magazine Issues
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleSaveIssue} className="lg:col-span-4 bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs space-y-3 text-xs font-mono-editorial">
            <span className="font-bold text-[#111110] block">
              {editingIssue ? 'Edit Magazine Issue' : 'Add New Issue'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#6E6A62] mb-1">Issue #</label>
                <input
                  type="text"
                  required
                  value={iNumber}
                  onChange={(e) => setINumber(e.target.value)}
                  placeholder="Issue 05"
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
                />
              </div>
              <div>
                <label className="block text-[#6E6A62] mb-1">Date/Season</label>
                <input
                  type="text"
                  value={iDate}
                  onChange={(e) => setIDate(e.target.value)}
                  placeholder="Fall 2026"
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-[#6E6A62] mb-1">Issue Title *</label>
              <input
                type="text"
                required
                value={iTitle}
                onChange={(e) => setITitle(e.target.value)}
                placeholder="The Architecture of Memory"
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
              />
            </div>
            <div>
              <label className="block text-[#6E6A62] mb-1">Cover Image URL</label>
              <input
                type="url"
                value={iCoverImage}
                onChange={(e) => setICoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
              />
            </div>
            <div>
              <label className="block text-[#6E6A62] mb-1">Curator Note</label>
              <textarea
                rows={2}
                value={iCuratorNote}
                onChange={(e) => setICuratorNote(e.target.value)}
                placeholder="Letter from the editor..."
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#111110] text-white rounded-xs uppercase font-bold hover:bg-[#EA580C]"
            >
              {editingIssue ? 'Update Issue' : '+ Add Issue'}
            </button>
          </form>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {issues.map((iss) => (
              <div key={iss.id} className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs overflow-hidden shadow-xs flex flex-col justify-between">
                <div className="aspect-[3/4] max-h-56 bg-[#F9F8F6] overflow-hidden">
                  <img src={iss.coverImage} alt={iss.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-1">
                  <div className="flex justify-between text-[11px] font-mono-editorial text-[#EA580C] font-bold">
                    <span>{iss.number}</span>
                    <span className="text-[#8E8A81]">{iss.date}</span>
                  </div>
                  <h3 className="font-serif-editorial text-lg font-bold text-[#111110]">
                    {iss.title}
                  </h3>
                  <p className="text-xs text-[#6E6A62] line-clamp-2">{iss.curatorNote}</p>
                </div>
                <div className="p-3 bg-[#F9F8F6] border-t border-[#E8E5DF] flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingIssue(iss);
                      setINumber(iss.number);
                      setITitle(iss.title);
                      setITheme(iss.theme || '');
                      setIDate(iss.date);
                      setICoverImage(iss.coverImage);
                      setICuratorNote(iss.curatorNote);
                    }}
                    className="p-1 text-[#55524B] hover:text-[#111110]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ type: 'issue', id: iss.id, name: iss.title })}
                    className="p-1 text-[#DC2626] hover:bg-[#FEE2E2] rounded-xs cursor-pointer transition-colors"
                    title="Delete Issue"
                    aria-label={`Delete issue ${iss.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.type === 'series' ? 'Delete Editorial Series' : 'Delete Periodical Issue'}
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.type === 'series' ? 'series' : 'issue'} "${deleteTarget.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel={deleteTarget?.type === 'series' ? 'Delete Series' : 'Delete Issue'}
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
