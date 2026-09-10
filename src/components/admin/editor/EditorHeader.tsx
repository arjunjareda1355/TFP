import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Sparkles,
  Archive,
  Layers,
  Download,
  Upload,
  CheckCircle2,
  Cloud,
  HardDrive,
  RefreshCw,
  Clock,
  ChevronDown,
  Columns,
  Maximize2,
  FileText,
} from 'lucide-react';
import { ArticleStatus } from '../../../types';

export type EditorViewMode = 'studio' | 'focus' | 'split';

interface EditorHeaderProps {
  title: string;
  status: ArticleStatus;
  autoSaveStatus: 'idle' | 'saving' | 'synced' | 'local_saved' | 'restored';
  lastAutoSaveTime: string;
  isSaving: boolean;
  viewMode: EditorViewMode;
  onViewModeChange: (mode: EditorViewMode) => void;
  onBack: () => void;
  onOpenTemplates: () => void;
  onOpenVault: () => void;
  onOpenAi: () => void;
  onOpenExport: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  status,
  autoSaveStatus,
  lastAutoSaveTime,
  isSaving,
  viewMode,
  onViewModeChange,
  onBack,
  onOpenTemplates,
  onOpenVault,
  onOpenAi,
  onOpenExport,
  onSaveDraft,
  onPublish,
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Back & Title context */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 rounded-xl transition-colors shrink-0"
            title="Return to Dispatches"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex items-center gap-2.5">
            <h1 className="text-sm sm:text-base font-serif font-bold text-stone-100 truncate max-w-xs sm:max-w-md">
              {title.trim() || 'New Dispatch'}
            </h1>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shrink-0 ${
                status === 'PUBLISHED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  : status === 'SCHEDULED'
                  ? 'bg-sky-950 text-sky-300 border border-sky-800/60'
                  : 'bg-amber-950 text-amber-300 border border-amber-800/60'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Center: Realtime Persistence & Sync status pill */}
        <div className="hidden lg:flex items-center gap-2 bg-stone-800/80 border border-stone-700/60 rounded-full px-3 py-1 text-xs">
          {autoSaveStatus === 'saving' || isSaving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-stone-300 font-medium">Syncing changes...</span>
            </>
          ) : autoSaveStatus === 'synced' ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-stone-300">
                Cloud Synced (Supabase) {lastAutoSaveTime && `• ${lastAutoSaveTime}`}
              </span>
            </>
          ) : (
            <>
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-stone-300">Local Vault Protected</span>
            </>
          )}
        </div>

        {/* Right: View mode switcher & Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View mode toggle */}
          <div className="hidden md:flex items-center bg-stone-800 p-1 rounded-xl border border-stone-700/80 text-xs">
            <button
              onClick={() => onViewModeChange('studio')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'studio'
                  ? 'bg-stone-700 text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Studio Layout"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Studio</span>
            </button>
            <button
              onClick={() => onViewModeChange('split')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'split'
                  ? 'bg-stone-700 text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Split Realtime Preview"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Split</span>
            </button>
            <button
              onClick={() => onViewModeChange('focus')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'focus'
                  ? 'bg-stone-700 text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Zen Focus Writing Canvas"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Focus</span>
            </button>
          </div>

          {/* Quick utility icons */}
          <button
            onClick={onOpenTemplates}
            className="hidden sm:inline-flex p-2 text-stone-300 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors"
            title="Editorial Starter Templates"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenVault}
            className="hidden sm:inline-flex p-2 text-stone-300 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors"
            title="Draft Vault (All Backups)"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAi}
            className="p-2 text-amber-300 hover:text-amber-200 hover:bg-stone-800 rounded-xl transition-colors"
            title="AI Co-Pilot"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenExport}
            className="hidden sm:inline-flex p-2 text-stone-300 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors"
            title="Export / Import"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Mobile More Options Dropdown */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="p-2 text-stone-300 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors"
              title="More Actions"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {isActionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-stone-900 border border-stone-700 rounded-xl shadow-xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    onOpenTemplates();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-stone-800 flex items-center gap-2 text-stone-200"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <span>Templates</span>
                </button>
                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    onOpenVault();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-stone-800 flex items-center gap-2 text-stone-200"
                >
                  <Archive className="w-3.5 h-3.5 text-stone-400" />
                  <span>Draft Vault</span>
                </button>
                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    onOpenExport();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-stone-800 flex items-center gap-2 text-stone-200"
                >
                  <Download className="w-3.5 h-3.5 text-stone-400" />
                  <span>Export / Import</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-stone-700 mx-0.5 sm:mx-1" />

          {/* Save Draft Button */}
          <button
            onClick={onSaveDraft}
            disabled={isSaving}
            className="px-2.5 sm:px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-stone-50 text-xs font-semibold rounded-xl border border-stone-700 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          {/* Publish / Update Button */}
          <button
            onClick={onPublish}
            disabled={isSaving}
            className="px-3 sm:px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="truncate">{status === 'PUBLISHED' ? 'Update Live' : 'Publish'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
