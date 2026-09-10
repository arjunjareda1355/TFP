import React, { useState, useEffect } from 'react';
import {
  Layers,
  Save,
  CheckCircle2,
  Sparkles,
  Flame,
  Star,
  Compass,
  Film,
  Bookmark,
  ArrowRight,
} from 'lucide-react';
import { useMagazine } from '../../context/MagazineContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { HomepageLayoutConfig, Article } from '../../types';

export const AdminHomepageManager: React.FC = () => {
  const { articles, refreshAll } = useMagazine();
  const toast = useToast();
  const [layout, setLayout] = useState<HomepageLayoutConfig>({
    coverStoryId: '',
    trendingStoryIds: [],
    foldStoryIds: [],
    popularStoryIds: [],
    uniqueStoryIds: [],
    specialStoryIds: [],
    editorsPickIds: [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.getHomepageLayout().then((cfg) => {
      if (cfg) setLayout(cfg);
    });
  }, []);

  const published = articles.filter((a) => a.status === 'PUBLISHED' || !a.status);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateHomepageLayout(layout);
      await refreshAll();
      setSaveSuccess(true);
      toast.success('Homepage layout curated and saved successfully.');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      toast.error('Failed to save layout: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStoryInList = (field: keyof HomepageLayoutConfig, id: string) => {
    const currentList = (layout[field] as string[]) || [];
    const exists = currentList.includes(id);
    const updated = exists ? currentList.filter((item) => item !== id) : [...currentList, id];
    setLayout({ ...layout, [field]: updated });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-editorial text-3xl font-medium text-[#111110]">
            Homepage Visual Architecture & Curation
          </h1>
          <p className="text-xs font-mono-editorial text-[#6E6A62] mt-0.5">
            Design the editorial hierarchy, lead features, and story placements displayed on the homepage.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#C2410C] transition-colors shadow-xs shrink-0 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Updating...' : 'Save Curation'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] text-xs font-mono-editorial rounded-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Homepage curation updated successfully and live!</span>
        </div>
      )}

      {/* 1. COVER STORY HERO */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E8E5DF] pb-3">
          <Sparkles className="w-4 h-4 text-[#EA580C]" />
          <h3 className="font-serif-editorial text-lg font-medium text-[#111110]">
            1. Primary Cover Story (Hero Lead)
          </h3>
        </div>
        <p className="text-xs text-[#6E6A62]">
          The single paramount dispatch highlighted with large format typography and cover image.
        </p>

        <select
          value={layout.coverStoryId || ''}
          onChange={(e) => setLayout({ ...layout, coverStoryId: e.target.value })}
          className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs font-mono-editorial"
        >
          <option value="">Select Cover Story...</option>
          {published.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title} ({a.category} • by {a.author.name})
            </option>
          ))}
        </select>
      </div>

      {/* 2. TRENDING STORIES GRID */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E8E5DF] pb-3">
          <Flame className="w-4 h-4 text-[#EA580C]" />
          <h3 className="font-serif-editorial text-lg font-medium text-[#111110]">
            2. Trending Now Grid (Select 4 Stories)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {published.map((a) => {
            const isSelected = layout.trendingStoryIds?.includes(a.id);
            return (
              <div
                key={a.id}
                onClick={() => toggleStoryInList('trendingStoryIds', a.id)}
                className={`cursor-pointer p-3 border rounded-xs transition-all flex items-center gap-3 text-xs ${
                  isSelected
                    ? 'bg-[#FFF7ED] border-[#EA580C] text-[#9A3412]'
                    : 'bg-[#F9F8F6] border-[#E8E5DF] text-[#55524B] hover:border-[#D4CEBF]'
                }`}
              >
                <img src={a.heroImage} alt="" className="w-10 h-10 object-cover rounded-xs shrink-0" />
                <div className="truncate flex-1">
                  <div className="font-serif-editorial font-bold truncate">{a.title}</div>
                  <div className="text-[10px] font-mono-editorial text-[#8E8A81]">{a.category}</div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. THE FOLD SIGNATURE STORIES */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E8E5DF] pb-3">
          <Layers className="w-4 h-4 text-[#EA580C]" />
          <h3 className="font-serif-editorial text-lg font-medium text-[#111110]">
            3. "The Fold" Signature Section (Select 4 Stories)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {published.map((a) => {
            const isSelected = layout.foldStoryIds?.includes(a.id);
            return (
              <div
                key={a.id}
                onClick={() => toggleStoryInList('foldStoryIds', a.id)}
                className={`cursor-pointer p-3 border rounded-xs transition-all flex items-center gap-3 text-xs ${
                  isSelected
                    ? 'bg-[#FFF7ED] border-[#EA580C] text-[#9A3412]'
                    : 'bg-[#F9F8F6] border-[#E8E5DF] text-[#55524B] hover:border-[#D4CEBF]'
                }`}
              >
                <img src={a.heroImage} alt="" className="w-10 h-10 object-cover rounded-xs shrink-0" />
                <div className="truncate flex-1">
                  <div className="font-serif-editorial font-bold truncate">{a.title}</div>
                  <div className="text-[10px] font-mono-editorial text-[#8E8A81]">{a.category}</div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. UNIQUE & SPECIAL CINEMATIC SHOWCASES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E8E5DF] pb-3">
            <Compass className="w-4 h-4 text-[#EA580C]" />
            <h3 className="font-serif-editorial text-lg font-medium text-[#111110]">
              4. Unique Showcase Dispatches
            </h3>
          </div>

          <div className="space-y-2">
            {published.map((a) => {
              const isSelected = layout.uniqueStoryIds?.includes(a.id);
              return (
                <div
                  key={a.id}
                  onClick={() => toggleStoryInList('uniqueStoryIds', a.id)}
                  className={`cursor-pointer p-2.5 border rounded-xs flex items-center justify-between text-xs ${
                    isSelected ? 'bg-[#F0FDF4] border-[#16A34A] text-[#166534]' : 'bg-[#F9F8F6] border-[#E8E5DF]'
                  }`}
                >
                  <span className="font-serif-editorial font-bold truncate">{a.title}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E8E5DF] pb-3">
            <Film className="w-4 h-4 text-[#EA580C]" />
            <h3 className="font-serif-editorial text-lg font-medium text-[#111110]">
              5. Special Cinematic Dispatches
            </h3>
          </div>

          <div className="space-y-2">
            {published.map((a) => {
              const isSelected = layout.specialStoryIds?.includes(a.id);
              return (
                <div
                  key={a.id}
                  onClick={() => toggleStoryInList('specialStoryIds', a.id)}
                  className={`cursor-pointer p-2.5 border rounded-xs flex items-center justify-between text-xs ${
                    isSelected ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1E40AF]' : 'bg-[#F9F8F6] border-[#E8E5DF]'
                  }`}
                >
                  <span className="font-serif-editorial font-bold truncate">{a.title}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
