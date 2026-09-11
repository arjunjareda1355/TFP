import React, { useState, useEffect } from 'react';
import {
  Menu,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { useMagazine } from '../../context/MagazineContext';

interface NavItem {
  id: string;
  label: string;
  href: string;
  target?: string;
  order: number;
  isActive?: boolean;
}

export const AdminNavigationManager: React.FC = () => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [webItems, setWebItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New nav item draft
  const [newLabel, setNewLabel] = useState('');
  const [newHref, setNewHref] = useState('#');

  // New web item draft
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetPlacement, setNewWidgetPlacement] = useState('HEADER_BAR');
  const [newWidgetContent, setNewWidgetContent] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [nav, widgets] = await Promise.all([api.getNavigation(), api.getWebItems()]);
      setNavItems(nav || []);
      setWebItems(widgets || []);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load navigation data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveNav = async () => {
    setIsLoading(true);
    try {
      const updated = await api.updateNavigation(navItems);
      setNavItems(updated);
      setFeedback({ type: 'success', message: 'Navigation menu configuration successfully updated!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save navigation.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNavItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newHref) return;

    const newItem: NavItem = {
      id: `nav-${Date.now()}`,
      label: newLabel.trim(),
      href: newHref.trim(),
      order: navItems.length + 1,
      isActive: true,
    };

    setNavItems([...navItems, newItem]);
    setNewLabel('');
    setNewHref('#');
    setFeedback({ type: 'success', message: `Added "${newItem.label}". Click 'Save Navigation' to commit.` });
  };

  const handleRemoveNavItem = (id: string) => {
    setNavItems(navItems.filter((item) => item.id !== id));
  };

  const handleMoveNavItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= navItems.length) return;

    const list = [...navItems];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setNavItems(reordered);
  };

  const handleToggleNavActive = (id: string) => {
    setNavItems(
      navItems.map((item) =>
        item.id === id ? { ...item, isActive: item.isActive === false ? true : false } : item
      )
    );
  };

  const handleCreateWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetTitle) return;
    try {
      const created = await api.createWebItem({
        title: newWidgetTitle.trim(),
        placement: newWidgetPlacement,
        content: newWidgetContent.trim(),
        status: 'ACTIVE',
      });
      setWebItems([...webItems, created]);
      setNewWidgetTitle('');
      setNewWidgetContent('');
      setFeedback({ type: 'success', message: `Created web widget "${created.title}".` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create widget.' });
    }
  };

  const handleDeleteWidget = async (id: string) => {
    if (!window.confirm('Move widget to trash?')) return;
    try {
      await api.deleteWebItem(id);
      setWebItems(webItems.filter((w) => w.id !== id));
      setFeedback({ type: 'success', message: 'Widget moved to trash.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete widget.' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-editorial uppercase font-bold text-[#EA580C] mb-1">
            <Menu className="w-3.5 h-3.5" />
            <span>Site Navigation & Widgets Architecture</span>
          </div>
          <h1 className="font-serif-editorial text-2xl font-semibold text-[#111110]">
            Website Navigation & Web Items Manager
          </h1>
          <p className="text-xs text-[#6E6A62] mt-0.5">
            Configure primary top navigation links, masthead order, and modular promotional web items.
          </p>
        </div>

        <button
          onClick={handleSaveNav}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs shrink-0 whitespace-nowrap self-start sm:self-center"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>Save Navigation</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xs border flex items-center justify-between text-xs font-mono-editorial ${
            feedback.type === 'success'
              ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#DC2626]" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Links Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E5DF] flex items-center justify-between">
          <h2 className="font-serif-editorial text-base font-semibold text-[#111110]">
            Header Navigation Menu ({navItems.length})
          </h2>
          <span className="text-xs font-mono-editorial text-[#8C827A]">
            Drag or use arrows to reorder
          </span>
        </div>

        <div className="divide-y divide-[#E8E5DF]">
          {navItems.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FDFCFB]"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono-editorial text-xs text-[#8C827A] w-5 shrink-0">{idx + 1}.</span>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setNavItems(navItems.map((n) => (n.id === item.id ? { ...n, label } : n)));
                    }}
                    className="bg-[#FAF8F5] border border-[#E8E5DF] px-3 py-1.5 text-xs font-serif-editorial font-semibold text-[#111110] rounded-xs w-full sm:w-44"
                  />
                </div>
                <input
                  type="text"
                  value={item.href}
                  onChange={(e) => {
                    const href = e.target.value;
                    setNavItems(navItems.map((n) => (n.id === item.id ? { ...n, href } : n)));
                  }}
                  className="bg-[#FAF8F5] border border-[#E8E5DF] px-3 py-1.5 text-xs font-mono-editorial text-[#6E6A62] rounded-xs flex-1 w-full sm:max-w-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleNavActive(item.id)}
                  className={`p-1.5 rounded-xs transition-colors shrink-0 ${
                    item.isActive === false
                      ? 'text-[#8C827A] hover:text-[#111110] bg-[#F4F1EA]'
                      : 'text-[#16A34A] hover:bg-[#F0FDF4]'
                  }`}
                  title={item.isActive === false ? 'Hidden' : 'Visible'}
                >
                  {item.isActive === false ? <EyeOff className="w-4 h-4 shrink-0" /> : <Eye className="w-4 h-4 shrink-0" />}
                </button>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveNavItem(idx, 'up')}
                  className="p-1.5 text-[#6E6A62] hover:text-[#111110] disabled:opacity-30 shrink-0"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4 shrink-0" />
                </button>
                <button
                  type="button"
                  disabled={idx === navItems.length - 1}
                  onClick={() => handleMoveNavItem(idx, 'down')}
                  className="p-1.5 text-[#6E6A62] hover:text-[#111110] disabled:opacity-30 shrink-0"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveNavItem(item.id)}
                  className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-xs shrink-0"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Nav Item Form */}
        <form onSubmit={handleAddNavItem} className="p-4 bg-[#F9F8F6] border-t border-[#E8E5DF] flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Link Label (e.g. Dispatches)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="bg-white border border-[#E8E5DF] px-3 py-2 text-xs text-[#111110] rounded-xs w-full sm:w-44"
          />
          <input
            type="text"
            placeholder="Target Hash or URL (e.g. #issues or /#about)"
            value={newHref}
            onChange={(e) => setNewHref(e.target.value)}
            className="bg-white border border-[#E8E5DF] px-3 py-2 text-xs font-mono-editorial text-[#6E6A62] rounded-xs flex-1 w-full"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 px-4 py-2 bg-[#111110] hover:bg-[#2C2A26] text-white text-xs font-semibold rounded-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        </form>
      </div>

      {/* Web Items / Widgets Section */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs p-6 space-y-6">
        <div>
          <h2 className="font-serif-editorial text-lg font-semibold text-[#111110]">
            Modular Web Items & Header Banners ({webItems.length})
          </h2>
          <p className="text-xs text-[#6E6A62]">
            Custom announcement widgets, editorial alerts, and promotional blocks placed on the frontend.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {webItems.map((widget) => (
            <div key={widget.id} className="bg-[#FAF8F5] border border-[#E8E5DF] p-4 rounded-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-editorial text-[10px] font-bold uppercase tracking-wider text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-xs border border-[#FDBA74]">
                    {widget.placement}
                  </span>
                  <button
                    onClick={() => handleDeleteWidget(widget.id)}
                    className="text-[#DC2626] hover:bg-[#FEF2F2] p-1 rounded-xs"
                    title="Delete Widget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="font-serif-editorial font-semibold text-sm text-[#111110]">
                  {widget.title}
                </h3>
                <p className="text-xs text-[#55524B] mt-1 line-clamp-3">
                  {widget.content || 'Custom announcement banner'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Widget Form */}
        <form onSubmit={handleCreateWidget} className="p-4 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs space-y-3">
          <h3 className="font-serif-editorial font-semibold text-sm text-[#111110]">
            Create New Modular Widget
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Widget Title (e.g. Autumn Edition Announcement)"
              value={newWidgetTitle}
              onChange={(e) => setNewWidgetTitle(e.target.value)}
              className="bg-white border border-[#E8E5DF] px-3 py-2 text-xs rounded-xs"
            />
            <select
              value={newWidgetPlacement}
              onChange={(e) => setNewWidgetPlacement(e.target.value)}
              className="bg-white border border-[#E8E5DF] px-3 py-2 text-xs font-mono-editorial rounded-xs"
            >
              <option value="HEADER_BAR">Header Announcement Bar</option>
              <option value="SIDEBAR">Sidebar Widget</option>
              <option value="FOOTER_CALLOUT">Footer Callout</option>
            </select>
          </div>
          <textarea
            placeholder="Widget text or message body..."
            value={newWidgetContent}
            onChange={(e) => setNewWidgetContent(e.target.value)}
            rows={2}
            className="w-full bg-white border border-[#E8E5DF] px-3 py-2 text-xs rounded-xs"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111110] hover:bg-[#2C2A26] text-white text-xs font-semibold rounded-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Widget</span>
          </button>
        </form>
      </div>
    </div>
  );
};
