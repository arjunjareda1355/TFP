import React, { useState, useEffect } from 'react';
import {
  Archive,
  Search,
  FileText,
  Clock,
  Trash2,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  X,
  Cloud,
  HardDrive,
} from 'lucide-react';
import { Article } from '../../../types';
import { api } from '../../../services/api';

interface EditorDraftVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draft: Article) => void;
}

export const EditorDraftVaultModal: React.FC<EditorDraftVaultModalProps> = ({
  isOpen,
  onClose,
  onLoadDraft,
}) => {
  const [drafts, setDrafts] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);

    // 1. Gather local storage drafts
    const collected: Article[] = [];
    try {
      const vaultStr = localStorage.getItem('tfp_draft_vault');
      if (vaultStr) {
        const parsed = JSON.parse(vaultStr);
        if (Array.isArray(parsed)) collected.push(...parsed);
      }

      const cachedArticles = localStorage.getItem('tfp_cached_articles');
      if (cachedArticles) {
        const parsed = JSON.parse(cachedArticles);
        if (Array.isArray(parsed)) {
          const draftList = parsed.filter((a) => a.status === 'DRAFT');
          for (const d of draftList) {
            if (!collected.some((c) => c.id === d.id)) collected.push(d);
          }
        }
      }

      // Check auto-save new draft
      const newDraftStr = localStorage.getItem('tfp_draft_autosave_new');
      if (newDraftStr) {
        const parsed = JSON.parse(newDraftStr);
        if (parsed?.title && !collected.some((c) => c.title === parsed.title)) {
          collected.unshift({
            id: 'local-autosave-new',
            title: parsed.title,
            subtitle: parsed.subtitle || parsed.deck || '',
            deck: parsed.deck || '',
            status: 'DRAFT',
            category: parsed.category || 'Trending',
            slug: parsed.slug || 'untitled-draft',
            author: parsed.author || { id: 'auth-01', name: 'Editorial Desk', role: 'Staff', avatar: '', bio: '' },
            blocks: parsed.blocks || [],
            publishedDate: parsed.updatedAt ? new Date(parsed.updatedAt).toLocaleDateString() : 'Draft',
            updatedDate: parsed.updatedAt ? new Date(parsed.updatedAt).toLocaleDateString() : 'Draft',
            readTime: parsed.readTime || '4 min read',
            readTimeMinutes: parsed.readTimeMinutes || 4,
            tags: parsed.tags || [],
            heroImage: parsed.heroImage || '',
          });
        }
      }
    } catch (e) {
      console.warn('Draft vault local scan notice:', e);
    }

    // 2. Fetch server drafts
    api
      .getArticles({ status: 'DRAFT', includeDrafts: true })
      .then((res) => {
        if (res?.articles) {
          for (const sArt of res.articles) {
            if (!collected.some((c) => c.id === sArt.id)) {
              collected.push(sArt);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setDrafts(collected);
        setIsLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredDrafts = drafts.filter((d) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (d.title && d.title.toLowerCase().includes(q)) ||
      (d.category && d.category.toLowerCase().includes(q)) ||
      (d.deck && d.deck.toLowerCase().includes(q))
    );
  });

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const vaultStr = localStorage.getItem('tfp_draft_vault');
      if (vaultStr) {
        const list: Article[] = JSON.parse(vaultStr);
        const next = list.filter((a) => a.id !== id);
        localStorage.setItem('tfp_draft_vault', JSON.stringify(next));
      }
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-900 text-amber-50 rounded-xl">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">Editorial Draft Vault</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                All auto-saved session drafts, local cache backups, and cloud revisions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-stone-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drafts by title, category, or deck..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Drafts List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-stone-400">Loading drafts from vault...</div>
          ) : filteredDrafts.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-600">No drafts currently found in the vault.</p>
              <p className="text-xs text-stone-400 mt-1">
                Drafts are automatically indexed here as you write, preventing any data loss.
              </p>
            </div>
          ) : (
            filteredDrafts.map((d) => {
              const wordCount = (d.blocks || []).reduce((acc, b) => {
                const text = b.text || b.title || '';
                return acc + (text ? text.trim().split(/\s+/).length : 0);
              }, 0) + (d.title ? d.title.trim().split(/\s+/).length : 0);

              return (
                <div
                  key={d.id}
                  onClick={() => {
                    onLoadDraft(d);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-stone-200 hover:border-stone-900 bg-white hover:bg-stone-50/50 transition-all cursor-pointer shadow-2xs hover:shadow-md flex items-center justify-between gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/60 rounded">
                        Draft
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {d.category || 'General'}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {d.updatedDate || d.publishedDate || 'Recently edited'}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-[11px] text-stone-400">
                        {wordCount} words
                      </span>
                    </div>
                    <h4 className="text-base font-serif font-bold text-stone-900 truncate group-hover:text-amber-950 transition-colors">
                      {d.title || 'Untitled Draft'}
                    </h4>
                    {d.deck && (
                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                        {d.deck}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDeleteDraft(d.id, e)}
                      title="Delete draft from vault"
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="px-3 py-1.5 bg-stone-900 text-stone-100 rounded-lg text-xs font-medium flex items-center gap-1.5 group-hover:bg-amber-900 transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Open Draft</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/70 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-600" />
            <span>Vault is automatically synced with Supabase and local browser cache.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-stone-700 hover:bg-stone-200/60 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
