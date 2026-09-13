import React, { useState, useEffect } from 'react';
import {
  Share2,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Rss,
  Mail,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  Radio,
  Eye,
  EyeOff,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Globe,
  Save,
  MessageSquare,
  Bookmark,
  Send,
} from 'lucide-react';
import { useMagazine } from '../../context/MagazineContext';
import { useToast } from '../../context/ToastContext';
import { SocialChannel } from '../../types';
import { DEFAULT_SOCIAL_CHANNELS } from '../../data/social';
import { AdminConfirmDialog } from './AdminConfirmDialog';

export const getIconPreview = (iconName?: string, id?: string) => {
  const normalized = (iconName || id || '').toLowerCase();
  if (normalized.includes('twitter') || normalized.includes('x')) return Twitter;
  if (normalized.includes('instagram')) return Instagram;
  if (normalized.includes('youtube')) return Youtube;
  if (normalized.includes('linkedin')) return Linkedin;
  if (normalized.includes('rss') || normalized.includes('feed')) return Rss;
  if (normalized.includes('newsletter') || normalized.includes('mail')) return Mail;
  if (normalized.includes('telegram') || normalized.includes('send')) return Send;
  if (normalized.includes('message') || normalized.includes('chat')) return MessageSquare;
  if (normalized.includes('bookmark')) return Bookmark;
  return Globe;
};

export const AdminSocialMedia: React.FC = () => {
  const {
    socialChannels,
    updateSocialChannels,
    resetSocialChannels,
    isOwner,
    currentUser,
  } = useMagazine();
  const toast = useToast();

  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<SocialChannel | null>(null);
  const [isResetDefaultsConfirmOpen, setIsResetDefaultsConfirmOpen] = useState(false);

  // New channel draft state
  const [newChannel, setNewChannel] = useState<Partial<SocialChannel>>({
    name: '',
    handle: '@',
    url: 'https://',
    description: '',
    badge: 'Social',
    followerCount: '1.0K',
    iconName: 'Twitter',
    isActive: true,
  });

  useEffect(() => {
    if (socialChannels && socialChannels.length > 0) {
      setChannels(socialChannels);
    } else {
      setChannels(DEFAULT_SOCIAL_CHANNELS);
    }
  }, [socialChannels]);

  const handleFieldChange = (id: string, field: keyof SocialChannel, value: any) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleToggleActive = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: c.isActive === false ? true : false } : c))
    );
  };

  const handleDeleteChannel = (channel: SocialChannel) => {
    setChannelToDelete(channel);
  };

  const handleConfirmDeleteChannel = () => {
    if (!channelToDelete) return;
    setChannels((prev) => prev.filter((c) => c.id !== channelToDelete.id));
    setChannelToDelete(null);
    toast.success('Channel removed from active draft. Click Save to persist.');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= channels.length) return;

    const updated = [...channels];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // re-assign order property
    const reordered = updated.map((ch, idx) => ({ ...ch, order: idx + 1 }));
    setChannels(reordered);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateSocialChannels(channels);
      setSaveMessage('All social channels & feeds successfully saved to database!');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      setSaveMessage(`Error saving channels: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setIsResetDefaultsConfirmOpen(true);
  };

  const handleConfirmResetToDefaults = async () => {
    setIsSaving(true);
    try {
      await resetSocialChannels();
      setChannels(DEFAULT_SOCIAL_CHANNELS);
      setSaveMessage('Social channels restored to editorial defaults.');
      setIsResetDefaultsConfirmOpen(false);
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.name || !newChannel.url) {
      toast.warning('Please provide a channel name and valid URL.');
      return;
    }

    const created: SocialChannel = {
      id: `custom-channel-${Date.now()}`,
      name: newChannel.name.trim(),
      handle: (newChannel.handle || '@').trim(),
      description: newChannel.description?.trim() || 'Official channel and syndication dispatch.',
      url: newChannel.url.trim(),
      iconName: newChannel.iconName || 'Globe',
      badge: newChannel.badge?.trim() || 'Channel',
      followerCount: newChannel.followerCount?.trim() || 'Active',
      order: channels.length + 1,
      isActive: true,
    };

    const updatedList = [...channels, created];
    setChannels(updatedList);
    setShowAddForm(false);
    toast.success(`Channel "${created.name}" added. Save changes to deploy live.`);
    setNewChannel({
      name: '',
      handle: '@',
      url: 'https://',
      description: '',
      badge: 'Social',
      followerCount: '1.0K',
      iconName: 'Twitter',
      isActive: true,
    });
    setSaveMessage(`Added "${created.name}". Remember to click "Save Channels Configuration" to persist.`);
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E5DF] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-editorial uppercase text-[#EA580C] font-bold tracking-wider mb-1">
            <Share2 className="w-4 h-4" />
            <span>Distribution & Public Channels</span>
          </div>
          <h1 className="font-serif-editorial text-3xl font-medium tracking-tight text-[#111110]">
            Social Media Accounts & Feeds
          </h1>
          <p className="text-xs text-[#55524B] mt-1 font-serif-editorial italic">
            "Configure links, handles, follower counts, descriptions and feeds shown across The Folded Page."
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetToDefaults}
            disabled={isSaving}
            className="px-3 py-2 bg-[#F4F3EF] hover:bg-[#EAE8E2] border border-[#E8E5DF] text-[#6E6A62] hover:text-[#111110] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-1.5"
            title="Reset to default links"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 bg-[#111110] hover:bg-[#2A2926] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Channel</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Channels Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Save Notification */}
      {saveMessage && (
        <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] rounded-xs flex items-center justify-between font-mono-editorial text-xs transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>{saveMessage}</span>
          </div>
          <button
            onClick={() => setSaveMessage(null)}
            className="text-[#065F46] hover:text-[#047857] font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Owner Access Banner */}
      <div className="bg-[#FAF9F6] border border-[#E8E5DF] p-4 rounded-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#111110] text-white flex items-center justify-center font-serif-editorial font-bold text-sm">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="text-xs font-bold text-[#111110]">
              Publisher Access: {currentUser?.email || 'Authorized Publisher'}
            </div>
            <div className="text-[11px] text-[#6E6A62]">
              {isOwner ? 'Full owner credentials active — edits update the live public site in real-time.' : 'Admin editor privileges active.'}
            </div>
          </div>
        </div>

        <div className="font-mono-editorial text-xs text-[#8E8A81] flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#16A34A] animate-pulse" />
          <span>{channels.filter((c) => c.isActive !== false).length} Active Channels</span>
        </div>
      </div>

      {/* Add New Channel Modal / Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddChannelSubmit}
          className="bg-[#FFFFFF] border-2 border-[#EA580C] p-6 rounded-xs shadow-md space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
            <h2 className="font-serif-editorial text-xl font-bold text-[#111110] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#EA580C]" />
              <span>Add New Social Account or Feed Link</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-mono-editorial text-[#8E8A81] hover:text-[#111110]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono-editorial uppercase text-[#6E6A62] font-bold mb-1">
                Channel Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Substack / Bluesky / TikTok"
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-editorial uppercase text-[#6E6A62] font-bold mb-1">
                Handle / Tag
              </label>
              <input
                type="text"
                placeholder="e.g. @thefoldedpage"
                value={newChannel.handle}
                onChange={(e) => setNewChannel({ ...newChannel, handle: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-editorial uppercase text-[#6E6A62] font-bold mb-1">
                Platform Icon
              </label>
              <select
                value={newChannel.iconName}
                onChange={(e) => setNewChannel({ ...newChannel, iconName: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C]"
              >
                <option value="Twitter">X / Twitter</option>
                <option value="Instagram">Instagram</option>
                <option value="Youtube">YouTube</option>
                <option value="Linkedin">LinkedIn</option>
                <option value="Mail">Newsletter / Mail</option>
                <option value="Rss">RSS / Feed</option>
                <option value="Send">Telegram / Dispatch</option>
                <option value="MessageSquare">Discord / Community</option>
                <option value="Bookmark">Substack / Medium</option>
                <option value="Globe">General Web / Link</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono-editorial uppercase text-[#6E6A62] font-bold mb-1">
                Destination URL *
              </label>
              <input
                type="text"
                required
                placeholder="https://..."
                value={newChannel.url}
                onChange={(e) => setNewChannel({ ...newChannel, url: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-editorial uppercase text-[#6E6A62] font-bold mb-1">
                Badge / Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Dispatches, Visuals"
                value={newChannel.badge}
                onChange={(e) => setNewChannel({ ...newChannel, badge: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-editorial uppercase text-[#6E6A62] font-bold mb-1">
                Audience / Follower Metric
              </label>
              <input
                type="text"
                placeholder="e.g. 50K+, Daily"
                value={newChannel.followerCount}
                onChange={(e) => setNewChannel({ ...newChannel, followerCount: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono-editorial uppercase text-[#6E6A62] font-bold mb-1">
                Editorial Description
              </label>
              <input
                type="text"
                placeholder="Short statement explaining what readers will find on this channel..."
                value={newChannel.description}
                onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E5DF]">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-[#F4F3EF] hover:bg-[#EAE8E2] text-xs font-semibold uppercase tracking-wider rounded-xs text-[#6E6A62]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs shadow-xs"
            >
              Add to Channel List
            </button>
          </div>
        </form>
      )}

      {/* Grid of Editable Social Channels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif-editorial text-xl font-bold text-[#111110]">
            Channel Configuration Cards ({channels.length})
          </h2>
          <span className="text-xs font-mono-editorial text-[#8E8A81]">
            Order top-to-bottom controls position on Homepage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {channels.map((channel, index) => {
            const Icon = getIconPreview(channel.iconName, channel.id);
            const isActive = channel.isActive !== false;

            return (
              <div
                key={channel.id}
                id={`admin-channel-${channel.id}`}
                className={`bg-[#FFFFFF] border rounded-xs p-6 shadow-xs flex flex-col justify-between transition-all ${
                  isActive ? 'border-[#E8E5DF]' : 'border-[#E8E5DF] opacity-60 bg-[#FAF9F6]'
                }`}
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E8E5DF]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xs bg-[#F9F8F6] border border-[#E8E5DF] text-[#111110] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono-editorial uppercase text-[#8E8A81]">
                          Position #{index + 1}
                        </span>
                        <div className="font-serif-editorial font-bold text-base text-[#111110] truncate">
                          {channel.name || 'Unnamed Channel'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* Reorder Up */}
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-[#8E8A81] hover:text-[#111110] hover:bg-[#F4F3EF] rounded-xs disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Reorder Down */}
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === channels.length - 1}
                        className="p-1.5 text-[#8E8A81] hover:text-[#111110] hover:bg-[#F4F3EF] rounded-xs disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Active */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(channel.id)}
                        className={`p-1.5 rounded-xs transition-colors ${
                          isActive
                            ? 'text-[#16A34A] hover:bg-[#ECFDF5]'
                            : 'text-[#DC2626] hover:bg-[#FEF2F2]'
                        }`}
                        title={isActive ? 'Active on Public Site' : 'Hidden from Public Site'}
                      >
                        {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteChannel(channel)}
                        className="p-1.5 text-[#8E8A81] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xs cursor-pointer"
                        title="Delete Channel"
                        aria-label={`Delete ${channel.name} channel`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Form Fields for this channel */}
                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono-editorial uppercase text-[#8E8A81] mb-1 font-bold">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={channel.name}
                          onChange={(e) => handleFieldChange(channel.id, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono-editorial uppercase text-[#8E8A81] mb-1 font-bold">
                          Handle / Label
                        </label>
                        <input
                          type="text"
                          value={channel.handle}
                          onChange={(e) => handleFieldChange(channel.id, 'handle', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#EA580C] font-mono-editorial focus:outline-none focus:border-[#EA580C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-editorial uppercase text-[#8E8A81] mb-1 font-bold">
                        Target Link / Feed URL
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={channel.url}
                          onChange={(e) => handleFieldChange(channel.id, 'url', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] font-mono-editorial focus:outline-none focus:border-[#EA580C]"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopy(channel.url, channel.id)}
                          className="p-1.5 bg-[#F9F8F6] hover:bg-[#EAE8E2] border border-[#E8E5DF] rounded-xs text-[#6E6A62] hover:text-[#111110]"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={channel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#F9F8F6] hover:bg-[#EAE8E2] border border-[#E8E5DF] rounded-xs text-[#6E6A62] hover:text-[#111110]"
                          title="Open URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-editorial uppercase text-[#8E8A81] mb-1 font-bold">
                        Editorial Description
                      </label>
                      <textarea
                        rows={2}
                        value={channel.description}
                        onChange={(e) => handleFieldChange(channel.id, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-mono-editorial uppercase text-[#8E8A81] mb-1 font-bold">
                          Badge
                        </label>
                        <input
                          type="text"
                          value={channel.badge || ''}
                          onChange={(e) => handleFieldChange(channel.id, 'badge', e.target.value)}
                          className="w-full px-2 py-1 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono-editorial uppercase text-[#8E8A81] mb-1 font-bold">
                          Audience
                        </label>
                        <input
                          type="text"
                          value={channel.followerCount || ''}
                          onChange={(e) => handleFieldChange(channel.id, 'followerCount', e.target.value)}
                          className="w-full px-2 py-1 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono-editorial uppercase text-[#8E8A81] mb-1 font-bold">
                          Icon
                        </label>
                        <select
                          value={channel.iconName || 'Globe'}
                          onChange={(e) => handleFieldChange(channel.id, 'iconName', e.target.value)}
                          className="w-full px-2 py-1 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs text-xs text-[#111110] focus:outline-none focus:border-[#EA580C]"
                        >
                          <option value="Twitter">Twitter / X</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Youtube">YouTube</option>
                          <option value="Linkedin">LinkedIn</option>
                          <option value="Mail">Newsletter / Mail</option>
                          <option value="Rss">RSS Feed</option>
                          <option value="Send">Telegram / Send</option>
                          <option value="MessageSquare">Discord / Chat</option>
                          <option value="Bookmark">Medium / Substack</option>
                          <option value="Globe">Web / Globe</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="pt-3 mt-4 border-t border-[#E8E5DF] flex items-center justify-between text-[11px] font-mono-editorial">
                  <span className={isActive ? 'text-[#16A34A] font-semibold' : 'text-[#DC2626] font-semibold'}>
                    {isActive ? '● Published on Site' : '○ Hidden from Site'}
                  </span>
                  {copiedId === channel.id && (
                    <span className="text-[#16A34A] font-semibold">Link copied!</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Syndication & RSS Info Card */}
      <div className="bg-[#FAF9F6] border border-[#E8E5DF] p-6 rounded-xs">
        <div className="flex items-center gap-2 mb-2">
          <Rss className="w-5 h-5 text-[#EA580C]" />
          <h3 className="font-serif-editorial font-bold text-lg text-[#111110]">
            Syndication & RSS 2.0 Feed
          </h3>
        </div>
        <p className="text-xs text-[#55524B] leading-relaxed mb-4">
          All published dispatches and editorial series are automatically syndicated at{' '}
          <code className="bg-[#EAE8E2] px-1 py-0.5 rounded-xs font-mono-editorial">/api/rss.xml</code>.
          Feed readers and news aggregators automatically poll this endpoint with full metadata, media attachments, and author credits.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111110] hover:bg-[#EA580C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Live XML Feed</span>
          </a>
          <button
            onClick={() => handleCopy(`${window.location.origin}/api/rss.xml`, 'rss-full')}
            className="px-3.5 py-2 bg-[#FFFFFF] border border-[#E8E5DF] hover:bg-[#F9F8F6] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
          >
            {copiedId === 'rss-full' ? 'Copied RSS URL!' : 'Copy Full Feed URL'}
          </button>
        </div>
      </div>

      {/* Delete Channel Confirmation */}
      <AdminConfirmDialog
        isOpen={Boolean(channelToDelete)}
        title="Remove Social Channel"
        message={
          channelToDelete
            ? `Are you sure you want to remove the "${channelToDelete.name}" (${channelToDelete.handle}) channel from the publication? Click "Save All Channels" afterwards to persist.`
            : ''
        }
        confirmLabel="Remove Channel"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={false}
        onConfirm={handleConfirmDeleteChannel}
        onClose={() => setChannelToDelete(null)}
      />

      {/* Reset Channels Confirmation */}
      <AdminConfirmDialog
        isOpen={isResetDefaultsConfirmOpen}
        title="Reset to Editorial Defaults"
        message="Are you sure you want to reset all social channels and feeds to the original editorial defaults? Any custom links will be replaced with standard presets."
        confirmLabel="Reset to Defaults"
        cancelLabel="Cancel"
        variant="warning"
        isLoading={isSaving}
        onConfirm={handleConfirmResetToDefaults}
        onClose={() => setIsResetDefaultsConfirmOpen(false)}
      />
    </div>
  );
};
