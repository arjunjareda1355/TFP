import React, { useState, useEffect } from 'react';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  Archive,
  Copy,
  Trash2,
  ExternalLink,
  Edit,
  Sparkles,
  ArrowUpDown,
  Tag,
  Grid,
  List,
} from 'lucide-react';
import { useMagazine } from '../../context/MagazineContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Article, ArticleStatus } from '../../types';

interface AdminArticlesListProps {
  onNewArticle?: () => void;
  onCreateArticle?: () => void;
  onEditArticle: (id: string) => void;
  onPreviewArticle: (slug: string) => void;
}

export const AdminArticlesList: React.FC<AdminArticlesListProps> = ({
  onNewArticle,
  onCreateArticle,
  onEditArticle,
  onPreviewArticle,
}) => {
  const handleCreate = onCreateArticle || onNewArticle || (() => {});
  const { articles, categories, refreshArticles } = useMagazine();
  const toast = useToast();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [flagFilter, setFlagFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    refreshArticles();
  }, [refreshArticles]);

  // Filter logic
  const filteredArticles = articles.filter((a) => {
    const status = a.status || 'PUBLISHED';
    if (statusFilter !== 'ALL' && status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && a.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;

    if (flagFilter === 'COVER' && !a.isCoverStory) return false;
    if (flagFilter === 'TRENDING' && !a.isTrending) return false;
    if (flagFilter === 'EDITORS_PICK' && !a.isEditorsPick) return false;
    if (flagFilter === 'UNIQUE' && !a.isUnique) return false;
    if (flagFilter === 'SPECIAL' && !a.isSpecial) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        (a.deck && a.deck.toLowerCase().includes(q)) ||
        a.author.name.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Action handlers
  const handleTogglePublish = async (article: Article) => {
    const isPub = article.status === 'PUBLISHED' || !article.status;
    setIsProcessing(true);
    try {
      if (isPub) {
        await api.unpublishArticle(article.id);
        toast.info(`"${article.title}" unpublished to drafts.`);
      } else {
        await api.publishArticle(article.id);
        toast.success(`"${article.title}" published live!`);
      }
      await refreshArticles();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setIsProcessing(true);
    try {
      const duplicated = await api.duplicateArticle(id);
      await refreshArticles();
      toast.success('Article duplicated successfully.');
      onEditArticle(duplicated.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate article');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async (id: string) => {
    setIsProcessing(true);
    try {
      await api.archiveArticle(id);
      await refreshArticles();
      toast.info('Article archived.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to archive article');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setIsProcessing(true);
    try {
      await api.deleteArticle(id);
      await refreshArticles();
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
      toast.success(`"${title}" deleted successfully.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete article');
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredArticles.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      await Promise.all(selectedIds.map((id) => api.publishArticle(id)));
      await refreshArticles();
      toast.success(`Published ${selectedIds.length} dispatches.`);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.message || 'Bulk publish error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      await Promise.all(selectedIds.map((id) => api.archiveArticle(id)));
      await refreshArticles();
      toast.info(`Archived ${selectedIds.length} dispatches.`);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.message || 'Bulk archive error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} dispatches?`)) return;
    setIsProcessing(true);
    try {
      await Promise.all(selectedIds.map((id) => api.deleteArticle(id)));
      await refreshArticles();
      toast.success(`Deleted ${selectedIds.length} dispatches.`);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.message || 'Bulk delete error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-editorial text-3xl font-medium text-[#111110]">
            Editorial Dispatches
          </h1>
          <p className="text-xs font-mono-editorial text-[#6E6A62] mt-0.5">
            Manage all publications, scheduled drafts, and archived essays.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
          {/* Studio Features link button */}
          <a
            href="https://ais-pre-cgynibd2vuyveurtgk7rds-119232530641.asia-southeast1.run.app/"
            target="_self"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 border border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFEDD5] text-xs font-mono-editorial font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs shrink-0 whitespace-nowrap"
            title="Open The Folded Studio to design articles and images (opens in same tab)"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EA580C] shrink-0" />
            <span>Studio Features</span>
          </a>

          {/* New Article button */}
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#EA580C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#C2410C] transition-colors shadow-xs shrink-0 whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-4 rounded-xs shadow-xs space-y-3">
        {/* Status Tabs and View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E5DF] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All Articles', count: articles.length },
              { id: 'PUBLISHED', label: 'Published', count: articles.filter((a) => a.status === 'PUBLISHED' || !a.status).length },
              { id: 'DRAFT', label: 'Drafts', count: articles.filter((a) => a.status === 'DRAFT').length },
              { id: 'SCHEDULED', label: 'Scheduled', count: articles.filter((a) => a.status === 'SCHEDULED').length },
              { id: 'ARCHIVED', label: 'Archived', count: articles.filter((a) => a.status === 'ARCHIVED').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xs text-xs font-mono-editorial transition-all ${
                  statusFilter === tab.id
                    ? 'bg-[#111110] text-[#FFFFFF] font-bold'
                    : 'bg-[#F9F8F6] text-[#55524B] hover:text-[#111110] hover:bg-[#F0EEEA]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 border rounded-xs ${
                viewMode === 'list'
                  ? 'bg-[#EA580C] text-white border-[#EA580C]'
                  : 'bg-[#FFFFFF] text-[#6E6A62] border-[#E8E5DF] hover:text-[#111110]'
              }`}
              title="Table/List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 border rounded-xs ${
                viewMode === 'grid'
                  ? 'bg-[#EA580C] text-white border-[#EA580C]'
                  : 'bg-[#FFFFFF] text-[#6E6A62] border-[#E8E5DF] hover:text-[#111110]'
              }`}
              title="Card Grid view"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8A81]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, deck, slug, or author..."
              className="w-full pl-9 pr-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] placeholder:text-[#8E8A81] focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C] font-mono-editorial"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={flagFilter}
              onChange={(e) => setFlagFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C] font-mono-editorial"
            >
              <option value="ALL">All Editorial Flags</option>
              <option value="COVER">Cover Story</option>
              <option value="TRENDING">Trending Now</option>
              <option value="EDITORS_PICK">Editor's Pick</option>
              <option value="UNIQUE">Unique Stories</option>
              <option value="SPECIAL">Special Cinematic</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls if items are selected */}
        {selectedIds.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#FFF7ED] border border-[#FED7AA] p-2.5 sm:p-3 rounded-xs text-xs">
            <span className="font-mono-editorial font-bold text-[#9A3412] shrink-0">
              {selectedIds.length} dispatch{selectedIds.length > 1 ? 'es' : ''} selected
            </span>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={handleBulkPublish}
                disabled={isProcessing}
                className="px-2.5 py-1.5 bg-[#16A34A] text-white rounded-xs text-xs font-semibold hover:bg-[#15803D] shrink-0 whitespace-nowrap transition-colors"
              >
                Publish Selected
              </button>
              <button
                onClick={handleBulkArchive}
                disabled={isProcessing}
                className="px-2.5 py-1.5 bg-[#4B5563] text-white rounded-xs text-xs font-semibold hover:bg-[#374151] shrink-0 whitespace-nowrap transition-colors"
              >
                Archive Selected
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className="px-2.5 py-1.5 bg-[#DC2626] text-white rounded-xs text-xs font-semibold hover:bg-[#B91C1C] shrink-0 whitespace-nowrap transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Articles Table or Card Grid */}
      {viewMode === 'list' ? (
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans-editorial min-w-[760px]">
            <thead className="bg-[#F9F8F6] border-b border-[#E8E5DF] text-[#6E6A62] font-mono-editorial uppercase">
              <tr>
                <th className="py-3 px-4 w-8">
                  <input
                    type="checkbox"
                    checked={
                      filteredArticles.length > 0 &&
                      selectedIds.length === filteredArticles.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded-xs text-[#EA580C] focus:ring-0"
                  />
                </th>
                <th className="py-3 px-4">Dispatch Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Flags</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Published</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF]">
              {filteredArticles.map((article) => {
                const status = article.status || 'PUBLISHED';
                const isSelected = selectedIds.includes(article.id);

                return (
                  <tr
                    key={article.id}
                    className={`hover:bg-[#FAF9F6] transition-colors ${
                      isSelected ? 'bg-[#FFFBEB]' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(article.id)}
                        className="rounded-xs text-[#EA580C] focus:ring-0"
                      />
                    </td>
                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-3">
                        <img
                          src={article.heroImage}
                          alt=""
                          className="w-12 h-12 object-cover rounded-xs border border-[#E8E5DF] shrink-0"
                        />
                        <div className="truncate">
                          <button
                            onClick={() => onEditArticle(article.id)}
                            className="font-serif-editorial text-sm font-semibold text-[#111110] hover:text-[#EA580C] transition-colors block truncate text-left"
                          >
                            {article.title}
                          </button>
                          <div className="text-[11px] text-[#8E8A81] font-mono-editorial flex items-center gap-1.5 truncate">
                            <span>/{article.slug}</span>
                            <span>•</span>
                            <span>{article.readTime}</span>
                            <span>•</span>
                            <span>{(article.viewCount || 0).toLocaleString()} views</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono-editorial uppercase text-[#55524B]">
                      {article.category}
                      {article.subcategory && (
                        <span className="block text-[10px] text-[#8E8A81]">
                          /{article.subcategory}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono-editorial text-[#55524B]">
                      {article.author.name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {article.isCoverStory && (
                          <span className="px-1.5 py-0.5 bg-[#111110] text-white text-[9px] font-mono-editorial uppercase rounded-xs">
                            Cover
                          </span>
                        )}
                        {article.isTrending && (
                          <span className="px-1.5 py-0.5 bg-[#EA580C] text-white text-[9px] font-mono-editorial uppercase rounded-xs">
                            Trending
                          </span>
                        )}
                        {article.isEditorsPick && (
                          <span className="px-1.5 py-0.5 bg-[#FEF3C7] text-[#92400E] text-[9px] font-mono-editorial uppercase rounded-xs">
                            Pick
                          </span>
                        )}
                        {article.isUnique && (
                          <span className="px-1.5 py-0.5 bg-[#F0FDF4] text-[#166534] text-[9px] font-mono-editorial uppercase rounded-xs">
                            Unique
                          </span>
                        )}
                        {article.isSpecial && (
                          <span className="px-1.5 py-0.5 bg-[#EFF6FF] text-[#1E40AF] text-[9px] font-mono-editorial uppercase rounded-xs">
                            Special
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono-editorial">
                      {status === 'PUBLISHED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#DCFCE7] text-[#166534] text-[10px] font-bold uppercase">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Published
                        </span>
                      )}
                      {status === 'DRAFT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#F3F4F6] text-[#4B5563] text-[10px] font-bold uppercase">
                          <AlertCircle className="w-2.5 h-2.5" /> Draft
                        </span>
                      )}
                      {status === 'SCHEDULED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold uppercase">
                          <Clock className="w-2.5 h-2.5" /> Scheduled
                        </span>
                      )}
                      {status === 'ARCHIVED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#FEE2E2] text-[#991B1B] text-[10px] font-bold uppercase">
                          <Archive className="w-2.5 h-2.5" /> Archived
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono-editorial text-[#6E6A62]">
                      {article.publishedDate}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap shrink-0">
                        <button
                          onClick={() => onEditArticle(article.id)}
                          className="p-1.5 text-[#55524B] hover:text-[#111110] bg-[#F9F8F6] hover:bg-[#E8E5DF] rounded-xs transition-colors shrink-0"
                          title="Edit article"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleTogglePublish(article)}
                          className={`p-1.5 rounded-xs transition-colors shrink-0 ${
                            status === 'PUBLISHED'
                              ? 'text-[#166534] bg-[#DCFCE7] hover:bg-[#BBF7D0]'
                              : 'text-[#EA580C] bg-[#FFF7ED] hover:bg-[#FFEDD5]'
                          }`}
                          title={status === 'PUBLISHED' ? 'Unpublish to draft' : 'Publish live'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDuplicate(article.id)}
                          className="p-1.5 text-[#55524B] hover:text-[#111110] bg-[#F9F8F6] hover:bg-[#E8E5DF] rounded-xs transition-colors shrink-0"
                          title="Duplicate article"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            try {
                              localStorage.setItem('tfp_preview_article', JSON.stringify(article));
                              if (article.slug) localStorage.setItem(`tfp_preview_${article.slug}`, JSON.stringify(article));
                              if (article.id) localStorage.setItem(`tfp_preview_${article.id}`, JSON.stringify(article));
                            } catch {}
                            onPreviewArticle(article.slug || article.id);
                          }}
                          className="p-1.5 text-[#55524B] hover:text-[#111110] bg-[#F9F8F6] hover:bg-[#E8E5DF] rounded-xs transition-colors shrink-0"
                          title="Preview in magazine"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          className="p-1.5 text-[#DC2626] hover:text-white hover:bg-[#DC2626] bg-[#FEE2E2] rounded-xs transition-colors shrink-0"
                          title="Delete dispatch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#8E8A81]">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[#D4CEBF]" />
                    <p className="font-serif-editorial text-lg text-[#111110]">No dispatches found</p>
                    <p className="text-xs font-mono-editorial mt-1">
                      Try adjusting your filters or search terms.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const status = article.status || 'PUBLISHED';
            const isSelected = selectedIds.includes(article.id);

            return (
              <div
                key={article.id}
                className={`bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs p-4 flex flex-col justify-between hover:border-[#EA580C] transition-all ${
                  isSelected ? 'ring-2 ring-[#EA580C]' : ''
                }`}
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xs border border-[#E8E5DF] mb-3 bg-[#F9F8F6]">
                    <img
                      src={article.heroImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span
                        className={`text-[9px] font-mono-editorial font-bold uppercase px-2 py-0.5 rounded-xs shadow-xs ${
                          status === 'PUBLISHED'
                            ? 'bg-[#DCFCE7] text-[#166534]'
                            : status === 'SCHEDULED'
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-[#F3F4F6] text-[#4B5563]'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono-editorial text-[#6E6A62] mb-1.5">
                    <span className="text-[#EA580C] font-semibold">{article.category}</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3
                    onClick={() => onEditArticle(article.id)}
                    className="font-serif-editorial font-bold text-base text-[#111110] hover:text-[#EA580C] cursor-pointer transition-colors line-clamp-2 mb-2 leading-snug"
                  >
                    {article.title}
                  </h3>

                  <p className="text-xs text-[#55524B] line-clamp-2 mb-3">
                    {article.deck || article.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E5DF] flex items-center justify-between">
                  <div className="text-[11px] font-mono-editorial text-[#8E8A81]">
                    By {article.author.name}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditArticle(article.id)}
                      className="p-1.5 text-[#55524B] hover:text-[#111110] bg-[#F9F8F6] hover:bg-[#E8E5DF] rounded-xs transition-colors shrink-0"
                      title="Edit article"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleTogglePublish(article)}
                      className={`p-1.5 rounded-xs transition-colors shrink-0 ${
                        status === 'PUBLISHED'
                          ? 'text-[#166534] bg-[#DCFCE7] hover:bg-[#BBF7D0]'
                          : 'text-[#EA580C] bg-[#FFF7ED] hover:bg-[#FFEDD5]'
                      }`}
                      title={status === 'PUBLISHED' ? 'Unpublish to draft' : 'Publish live'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id, article.title)}
                      className="p-1.5 text-[#DC2626] hover:text-white hover:bg-[#DC2626] bg-[#FEE2E2] rounded-xs transition-colors shrink-0"
                      title="Delete dispatch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredArticles.length === 0 && (
            <div className="col-span-full py-16 text-center text-[#8E8A81]">
              <FileText className="w-8 h-8 mx-auto mb-2 text-[#D4CEBF]" />
              <p className="font-serif-editorial text-lg text-[#111110]">No dispatches found</p>
              <p className="text-xs font-mono-editorial mt-1">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
