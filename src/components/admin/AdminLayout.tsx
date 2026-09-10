import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  Image as ImageIcon,
  FolderTree,
  Users,
  BookMarked,
  LayoutGrid,
  Mail,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
  Share2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Compass,
  Trash2,
  Key,
} from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { useMagazine } from '../../context/MagazineContext';
import { BrandLogo } from '../BrandLogo';

export type AdminTab =
  | 'overview'
  | 'articles'
  | 'editor'
  | 'users'
  | 'social'
  | 'navigation'
  | 'trash'
  | 'logs'
  | 'media'
  | 'homepage'
  | 'categories'
  | 'authors'
  | 'series-issues'
  | 'subscribers'
  | 'analytics'
  | 'api-keys';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onNavigateHome: () => void;
  onEditArticle?: (id: string) => void;
  children: React.ReactNode;
}

interface NavSection {
  title: string;
  items: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onNavigateHome,
  children,
}) => {
  const { currentUser, isOwner, articles } = useMagazine();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const draftCount = articles.filter((a) => a.status === 'DRAFT').length;

  const navSections: NavSection[] = [
    {
      title: 'Editorial Desk',
      items: [
        { id: 'overview', label: 'Publication Overview', icon: LayoutGrid },
        { id: 'articles', label: 'All Dispatches', icon: FileText, badge: draftCount > 0 ? `${draftCount} drafts` : undefined },
        { id: 'editor', label: 'Article Studio', icon: PlusCircle },
        { id: 'homepage', label: 'Homepage Curation', icon: Layers },
        { id: 'categories', label: 'Categories & Tags', icon: FolderTree },
        { id: 'media', label: 'Media Library', icon: ImageIcon },
      ],
    },
    {
      title: 'Editions & Authors',
      items: [
        { id: 'series-issues', label: 'Series & Editions', icon: BookMarked },
        { id: 'authors', label: 'Masthead Authors', icon: Users },
      ],
    },
    {
      title: 'Audience & Feeds',
      items: [
        { id: 'social', label: 'Social & Feeds', icon: Share2 },
        { id: 'subscribers', label: 'Newsletter & Audience', icon: Mail },
        { id: 'analytics', label: 'Readership Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Publisher Governance',
      items: [
        { id: 'users', label: 'Owner & Team Access', icon: ShieldCheck },
        { id: 'api-keys', label: 'API Keys & Control', icon: Key, badge: 'Live API' },
        { id: 'navigation', label: 'Navigation & Menus', icon: Compass },
        { id: 'logs', label: 'Audit Trail', icon: Sparkles },
        { id: 'trash', label: 'Recovery Vault', icon: Trash2 },
      ],
    },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    onSelectTab(tab);
    setIsMobileDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#111110] flex flex-col font-sans-editorial select-none">
      {/* Top Publisher Masthead Bar */}
      <header className="sticky top-0 z-40 bg-[#111110] text-[#FFFFFF] border-b border-[#2A2824] px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="lg:hidden p-1.5 text-[#A8A29E] hover:text-white transition-colors"
              aria-label="Toggle navigation drawer"
            >
              {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Logo & Studio Mark */}
            <div
              onClick={() => onSelectTab('overview')}
              className="cursor-pointer flex items-center gap-3 group"
            >
              <BrandLogo variant="emblem" size={28} theme="dark" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-serif-editorial font-bold text-base tracking-wider uppercase text-[#FFFFFF] group-hover:text-[#EA580C] transition-colors">
                    The Folded Page
                  </span>
                  <span className="bg-[#EA580C] text-[9px] font-mono-editorial font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-xs text-white">
                    Publisher Desk
                  </span>
                </div>
                <span className="text-[10px] font-mono-editorial text-[#8E8A81] hidden sm:block">
                  Verified Publication Control System
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono-editorial">
            {/* Quick action: Write New Dispatch */}
            <button
              onClick={() => onSelectTab('editor')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Dispatch</span>
            </button>

            {/* View Live Site */}
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#24221E] hover:bg-[#33302B] text-[#E8E5DF] transition-colors border border-[#3E3A33]"
              title="Return to the live public magazine"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#EA580C]" />
              <span className="hidden md:inline">Live Magazine</span>
            </button>

            {/* Owner Identity Badge & Clerk UserButton */}
            <div className="flex items-center gap-3 border-l border-[#2C2A26] pl-3 sm:pl-4">
              <div className="hidden lg:block text-right">
                <div className="font-bold text-white flex items-center justify-end gap-1.5 leading-tight text-xs">
                  <span>{currentUser?.name || 'Publisher'}</span>
                  {isOwner && (
                    <span title="Verified Publication Owner" className="inline-flex items-center text-[#F59E0B]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#A8A29E] leading-tight">
                  {currentUser?.role === 'OPERATIONS_OWNER'
                    ? 'OPERATIONS & PUBLISHING OWNER'
                    : currentUser?.role === 'EDITORIAL_OWNER'
                    ? 'EDITORIAL & PUBLISHING OWNER'
                    : currentUser?.role || 'OWNER'}
                </div>
              </div>

              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-7 h-7 ring-2 ring-[#EA580C]',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Publishing Workspace (Sidebar + Content Viewport) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Editorial Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-[#FFFFFF] border-r border-[#E8E5DF] transition-all duration-200 z-20 shrink-0 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Sidebar Collapse Toggle */}
          <div className="p-3 border-b border-[#E8E5DF] flex items-center justify-between">
            {!isSidebarCollapsed && (
              <span className="text-[11px] font-mono-editorial font-bold uppercase tracking-wider text-[#8E8A81]">
                Editorial Navigation
              </span>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1 text-[#8E8A81] hover:text-[#111110] hover:bg-[#F5F4F0] rounded-xs transition-colors ml-auto"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items grouped by section */}
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {!isSidebarCollapsed && (
                  <h4 className="px-2.5 text-[10px] font-mono-editorial font-bold uppercase tracking-widest text-[#8E8A81] mb-1.5">
                    {section.title}
                  </h4>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      title={item.label}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xs text-xs font-medium transition-colors text-left ${
                        isActive
                          ? 'bg-[#111110] text-[#FFFFFF] font-semibold shadow-xs'
                          : 'text-[#55524B] hover:text-[#111110] hover:bg-[#F5F4F0]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#EA580C]' : 'text-[#8E8A81]'}`} />
                      {!isSidebarCollapsed && (
                        <span className="flex-1 truncate font-mono-editorial">{item.label}</span>
                      )}
                      {!isSidebarCollapsed && item.badge && (
                        <span className="text-[9px] font-mono-editorial uppercase px-1.5 py-0.2 bg-[#FEF3C7] text-[#B45309] font-bold rounded-xs">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer Info */}
          {!isSidebarCollapsed && (
            <div className="p-3 border-t border-[#E8E5DF] bg-[#FAF9F6] text-[11px] font-mono-editorial text-[#8E8A81]">
              <div className="flex items-center justify-between">
                <span>The Folded Page v2.4</span>
                <span className="text-[#16A34A] font-bold">● Secure</span>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <div className="relative w-72 max-w-[85vw] bg-[#FFFFFF] border-r border-[#E8E5DF] flex flex-col h-full z-10 shadow-xl">
              <div className="p-4 border-b border-[#E8E5DF] flex items-center justify-between bg-[#111110] text-white">
                <div className="flex items-center gap-2">
                  <BrandLogo variant="emblem" size={24} theme="dark" />
                  <span className="font-serif-editorial font-bold text-sm">Publisher Desk</span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 text-[#A8A29E] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {navSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <h4 className="px-2 text-[10px] font-mono-editorial font-bold uppercase tracking-widest text-[#8E8A81] mb-1">
                      {section.title}
                    </h4>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-mono-editorial transition-colors text-left ${
                            isActive
                              ? 'bg-[#111110] text-[#FFFFFF] font-semibold'
                              : 'text-[#55524B] hover:text-[#111110] hover:bg-[#F5F4F0]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#EA580C]' : 'text-[#8E8A81]'}`} />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#FEF3C7] text-[#B45309] font-bold rounded-xs">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-[#E8E5DF] bg-[#FAF9F6]">
                <button
                  onClick={onNavigateHome}
                  className="w-full py-2 bg-[#111110] text-white text-xs font-mono-editorial uppercase font-bold rounded-xs flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Return to Magazine</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Admin Sub-Footer */}
      <footer className="bg-[#FFFFFF] border-t border-[#E8E5DF] py-3 px-6 text-xs font-mono-editorial text-[#8E8A81]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>THE FOLDED PAGE — Publication Control Desk</span>
          <span>{currentUser?.email ? `Logged in as: ${currentUser.email}` : 'Verified Editorial Session'}</span>
        </div>
      </footer>
    </div>
  );
};
