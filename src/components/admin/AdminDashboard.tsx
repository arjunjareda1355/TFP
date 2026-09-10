import React, { useEffect, useState } from 'react';
import {
  FileText,
  PlusCircle,
  Eye,
  Bookmark,
  Share2,
  Mail,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useMagazine } from '../../context/MagazineContext';
import { api } from '../../services/api';
import { AnalyticsStats, Article } from '../../types';
import { AdminTab } from './AdminLayout';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTab) => void;
  onEditArticle: (id: string) => void;
  onPreviewArticle?: (slug: string) => void;
  onCreateArticle?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onEditArticle,
  onPreviewArticle,
}) => {
  const { articles, refreshArticles, currentUser } = useMagazine();
  const [stats, setStats] = useState<AnalyticsStats>({
    totalViews: 0,
    totalSaves: 0,
    totalShares: 0,
    topArticles: [],
  });
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    api.getAnalytics().then(setStats).catch(() => {});
    api.getNewsletterSubscribers().then((subs) => setSubscriberCount(subs.length)).catch(() => {});
  }, []);

  const totalArticles = articles.length;
  const publishedCount = articles.filter((a) => a.status === 'PUBLISHED' || !a.status).length;
  const draftCount = articles.filter((a) => a.status === 'DRAFT').length;
  const scheduledCount = articles.filter((a) => a.status === 'SCHEDULED').length;

  const recentArticles = [...articles].slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 sm:p-8 rounded-xs shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-editorial uppercase font-bold text-[#EA580C] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editorial Operations Center</span>
          </div>
          <h1 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#111110]">
            Welcome back, {currentUser?.name || 'Publisher'}
          </h1>
          <p className="font-serif-editorial italic text-sm text-[#6E6A62] mt-1">
            "Directing publication, layout curation, and archival dispatch for The Folded Page."
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('editor')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EA580C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#C2410C] transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Dispatch</span>
          </button>
          <button
            onClick={() => onNavigateTab('media')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111110] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#2C2A26] transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media Library</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs shadow-xs">
          <div className="flex items-center justify-between text-[#8E8A81] mb-2">
            <span className="text-xs font-mono-editorial uppercase font-bold text-[#6E6A62]">Total Dispatches</span>
            <FileText className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#111110]">
            {totalArticles}
          </div>
          <div className="text-[11px] font-mono-editorial text-[#8E8A81] mt-1">
            {publishedCount} Published • {draftCount} Drafts
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs shadow-xs">
          <div className="flex items-center justify-between text-[#8E8A81] mb-2">
            <span className="text-xs font-mono-editorial uppercase font-bold text-[#6E6A62]">Reader Views</span>
            <Eye className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#111110]">
            {(stats.totalViews || 0).toLocaleString()}
          </div>
          <div className="text-[11px] font-mono-editorial text-[#16A34A] flex items-center gap-1 mt-1 font-bold">
            <TrendingUp className="w-3 h-3" /> Live Reader Activity
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs shadow-xs">
          <div className="flex items-center justify-between text-[#8E8A81] mb-2">
            <span className="text-xs font-mono-editorial uppercase font-bold text-[#6E6A62]">Saved to Library</span>
            <Bookmark className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#111110]">
            {stats.totalSaves || 0}
          </div>
          <div className="text-[11px] font-mono-editorial text-[#8E8A81] mt-1">
            {stats.totalShares || 0} Shares recorded
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs shadow-xs">
          <div className="flex items-center justify-between text-[#8E8A81] mb-2">
            <span className="text-xs font-mono-editorial uppercase font-bold text-[#6E6A62]">Subscribers</span>
            <Mail className="w-4 h-4 text-[#9333EA]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif-editorial font-bold text-[#111110]">
            {subscriberCount}
          </div>
          <div className="text-[11px] font-mono-editorial text-[#8E8A81] mt-1">
            The Folded Letter audience
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Section Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('users')}
          className="group cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs hover:border-[#EA580C] transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono-editorial font-bold uppercase text-[#EA580C]">
              Access & Governance
            </span>
            <ArrowRight className="w-4 h-4 text-[#8E8A81] group-hover:text-[#EA580C] group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-serif-editorial text-lg font-medium text-[#111110] mb-1">
            Owner & Team Access
          </h3>
          <p className="text-xs text-[#6E6A62] font-sans-editorial">
            Dual-owner governance, role assignments, writer invitations, and permissions.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('social')}
          className="group cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs hover:border-[#EA580C] transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono-editorial font-bold uppercase text-[#EA580C]">
              Broadcast & Feeds
            </span>
            <ArrowRight className="w-4 h-4 text-[#8E8A81] group-hover:text-[#EA580C] group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-serif-editorial text-lg font-medium text-[#111110] mb-1">
            Social Channels & Feeds
          </h3>
          <p className="text-xs text-[#6E6A62] font-sans-editorial">
            Edit and reorder external channels, RSS feeds, podcasts, and social profiles.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('trash')}
          className="group cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs hover:border-[#EA580C] transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono-editorial font-bold uppercase text-[#DC2626]">
              Recovery Vault
            </span>
            <ArrowRight className="w-4 h-4 text-[#8E8A81] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-serif-editorial text-lg font-medium text-[#111110] mb-1">
            Trash & Disaster Recovery
          </h3>
          <p className="text-xs text-[#6E6A62] font-sans-editorial">
            Restore soft-deleted dispatches or purge discarded drafts with owner authorization.
          </p>
        </div>
      </div>

      {/* Secondary Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('homepage')}
          className="group cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs hover:border-[#EA580C] transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono-editorial font-bold uppercase text-[#EA580C]">
              Visual Architecture
            </span>
            <ArrowRight className="w-4 h-4 text-[#8E8A81] group-hover:text-[#EA580C] group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-serif-editorial text-lg font-medium text-[#111110] mb-1">
            Homepage Curation
          </h3>
          <p className="text-xs text-[#6E6A62] font-sans-editorial">
            Assign the Cover Story, Trending grid, The Fold, Popular list, and special showcases.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('navigation')}
          className="group cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs hover:border-[#EA580C] transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono-editorial font-bold uppercase text-[#EA580C]">
              Navigation
            </span>
            <ArrowRight className="w-4 h-4 text-[#8E8A81] group-hover:text-[#EA580C] group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-serif-editorial text-lg font-medium text-[#111110] mb-1">
            Site Navigation & Widgets
          </h3>
          <p className="text-xs text-[#6E6A62] font-sans-editorial">
            Configure header navigation links, footer menus, and announcement widgets.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('logs')}
          className="group cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs hover:border-[#EA580C] transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono-editorial font-bold uppercase text-[#EA580C]">
              Security Trail
            </span>
            <ArrowRight className="w-4 h-4 text-[#8E8A81] group-hover:text-[#EA580C] group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-serif-editorial text-lg font-medium text-[#111110] mb-1">
            Security & Audit Trail
          </h3>
          <p className="text-xs text-[#6E6A62] font-sans-editorial">
            Real-time immutable audit logs of publications, invitations, logins, and settings.
          </p>
        </div>
      </div>

      {/* Recent Dispatches Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8E5DF] flex items-center justify-between">
          <div>
            <h2 className="font-serif-editorial text-lg font-medium text-[#111110]">
              Recent Editorial Dispatches
            </h2>
            <p className="text-xs font-mono-editorial text-[#6E6A62]">
              Latest authored and updated articles across the publication.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('articles')}
            className="text-xs font-semibold uppercase tracking-wider text-[#EA580C] hover:underline flex items-center gap-1"
          >
            <span>View All ({totalArticles})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans-editorial">
            <thead className="bg-[#F9F8F6] border-b border-[#E8E5DF] text-[#6E6A62] font-mono-editorial uppercase">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF]">
              {recentArticles.map((article) => {
                const status = article.status || 'PUBLISHED';
                return (
                  <tr key={article.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={article.heroImage}
                          alt=""
                          className="w-10 h-10 object-cover rounded-xs border border-[#E8E5DF] shrink-0"
                        />
                        <div className="truncate">
                          <button
                            onClick={() => onEditArticle(article.id)}
                            className="font-serif-editorial text-sm font-semibold text-[#111110] hover:text-[#EA580C] transition-colors block truncate text-left"
                          >
                            {article.title}
                          </button>
                          <span className="text-[11px] text-[#8E8A81] font-mono-editorial">
                            /{article.slug} • {article.readTime}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-editorial uppercase text-[#55524B]">
                      {article.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono-editorial text-[#55524B]">
                      {article.author.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono-editorial">
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
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono-editorial text-[#6E6A62]">
                      {article.publishedDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditArticle(article.id)}
                          className="px-2.5 py-1 bg-[#111110] text-white rounded-xs text-[11px] font-semibold uppercase hover:bg-[#EA580C] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (onPreviewArticle) {
                              onPreviewArticle(article.slug);
                            } else {
                              window.location.hash = `/story/${article.slug}`;
                            }
                          }}
                          className="p-1 text-[#6E6A62] hover:text-[#111110] transition-colors"
                          title="Preview live"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
