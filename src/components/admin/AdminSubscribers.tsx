import React, { useState, useEffect } from 'react';
import {
  Mail,
  Download,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  UserX,
  UserCheck,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';
import { NewsletterSubscriber, ContactSubmission } from '../../types';
import { useToast } from '../../context/ToastContext';
import { AdminConfirmDialog } from './AdminConfirmDialog';

export const AdminSubscribers: React.FC = () => {
  const { showToast } = useToast();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'newsletter' | 'inquiries'>('newsletter');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'pending' | 'unsubscribed'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<{ id: string; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBroadcastConfirm, setShowBroadcastConfirm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const subs = await api.getNewsletterSubscribers(statusFilter === 'ALL' ? undefined : statusFilter);
      setSubscribers(subs);
      const inquiries = await api.getContactSubmissions();
      setSubmissions(inquiries);
    } catch (e: any) {
      console.error(e);
      showToast('Failed to load audience data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleExportCSV = () => {
    const header = 'Email,Edition,Status,SubscribedAt,VerifiedAt\n';
    const rows = filteredSubscribers
      .map(
        (s) =>
          `"${s.email}","${s.edition || 'weekly'}","${s.status || 'active'}","${s.subscribedAt}","${
            s.verifiedAt || ''
          }"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folded-page-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast(`Exported ${filteredSubscribers.length} subscriber records`, 'success');
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'pending' | 'unsubscribed') => {
    try {
      await api.updateSubscriberStatus(id, newStatus);
      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
      showToast(`Subscriber status updated to ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update subscriber', 'error');
    }
  };

  const handleDeleteSubscriber = (id: string, email: string) => {
    setSubscriberToDelete({ id, email });
  };

  const handleConfirmDeleteSubscriber = async () => {
    if (!subscriberToDelete) return;
    setIsDeleting(true);
    const targetId = subscriberToDelete.id;
    try {
      await api.deleteSubscriber(targetId);
      setSubscribers((prev) => prev.filter((s) => s.id !== targetId));
      showToast('Subscriber removed from ledger', 'success');
      setSubscriberToDelete(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete subscriber', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBroadcast = () => {
    const activeCount = subscribers.filter((s) => (s.status || 'active') === 'active').length;
    if (activeCount === 0) {
      showToast('No active verified subscribers to broadcast to.', 'warning');
      return;
    }
    setShowBroadcastConfirm(true);
  };

  const handleConfirmBroadcast = async () => {
    setBroadcasting(true);
    try {
      const res = await api.broadcastLatestNewsletter();
      showToast(
        `Broadcast completed: Sent to ${res.recipientCount} active readers via Resend.`,
        'success'
      );
      setShowBroadcastConfirm(false);
    } catch (err: any) {
      showToast(err.message || 'Broadcast failed', 'error');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleUpdateContactStatus = async (id: string, status: 'unread' | 'read' | 'replied') => {
    await api.updateContactStatus(id, status);
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      !searchQuery || sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || (sub.status || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = subscribers.filter((s) => (s.status || 'active') === 'active').length;
  const pendingCount = subscribers.filter((s) => s.status === 'pending').length;
  const unsubscribedCount = subscribers.filter((s) => s.status === 'unsubscribed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-editorial text-3xl font-medium text-[#111110]">
            Audience & Inquiries
          </h1>
          <p className="text-xs font-mono-editorial text-[#6E6A62] mt-0.5">
            Manage newsletter subscribers for The Folded Letter and reader inquiries.
          </p>
        </div>

        {activeTab === 'newsletter' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBroadcast}
              disabled={broadcasting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#EA580C] text-white text-xs font-mono-editorial uppercase font-bold rounded-xs hover:bg-[#C2410C] transition-colors disabled:opacity-50 shadow-xs"
            >
              {broadcasting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Broadcasting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Broadcast Dispatch</span>
                </>
              )}
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#111110] text-white text-xs font-mono-editorial uppercase font-bold rounded-xs hover:bg-[#EA580C] transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E5DF]">
        <button
          onClick={() => setActiveTab('newsletter')}
          className={`px-4 py-2.5 text-xs font-mono-editorial uppercase font-bold border-b-2 transition-all ${
            activeTab === 'newsletter'
              ? 'border-[#EA580C] text-[#EA580C]'
              : 'border-transparent text-[#6E6A62] hover:text-[#111110]'
          }`}
        >
          The Folded Letter Subscribers ({subscribers.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2.5 text-xs font-mono-editorial uppercase font-bold border-b-2 transition-all ${
            activeTab === 'inquiries'
              ? 'border-[#EA580C] text-[#EA580C]'
              : 'border-transparent text-[#6E6A62] hover:text-[#111110]'
          }`}
        >
          Editorial Contact Submissions ({submissions.length})
        </button>
      </div>

      {activeTab === 'newsletter' ? (
        <div className="space-y-4">
          {/* Quick Metrics & Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-3 rounded-xs">
              <span className="text-[10px] font-mono-editorial uppercase text-[#6E6A62] font-bold block">
                Total Subscribers
              </span>
              <span className="font-serif-editorial text-2xl font-medium text-[#111110]">
                {subscribers.length}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-3 rounded-xs">
              <span className="text-[10px] font-mono-editorial uppercase text-[#16A34A] font-bold block">
                Active & Verified
              </span>
              <span className="font-serif-editorial text-2xl font-medium text-[#16A34A]">
                {activeCount}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-3 rounded-xs">
              <span className="text-[10px] font-mono-editorial uppercase text-[#D97706] font-bold block">
                Pending Confirmation
              </span>
              <span className="font-serif-editorial text-2xl font-medium text-[#D97706]">
                {pendingCount}
              </span>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-3 rounded-xs">
              <span className="text-[10px] font-mono-editorial uppercase text-[#6E6A62] font-bold block">
                Unsubscribed
              </span>
              <span className="font-serif-editorial text-2xl font-medium text-[#6E6A62]">
                {unsubscribedCount}
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center bg-[#F9F8F6] p-3 border border-[#E8E5DF] rounded-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#8E8A81] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email address..."
                className="w-full bg-[#FFFFFF] border border-[#E8E5DF] pl-9 pr-3 py-1.5 text-xs text-[#111110] rounded-xs placeholder:text-[#8E8A81] focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#FFFFFF] border border-[#E8E5DF] p-1 rounded-xs">
                {(['ALL', 'active', 'pending', 'unsubscribed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-[11px] font-mono-editorial uppercase font-bold rounded-xs transition-colors ${
                      statusFilter === st
                        ? 'bg-[#111110] text-white'
                        : 'text-[#6E6A62] hover:text-[#111110]'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st}
                  </button>
                ))}
              </div>

              <button
                onClick={loadData}
                className="p-2 text-[#6E6A62] hover:text-[#111110] bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs hover:border-[#8E8A81]"
                title="Refresh subscribers"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-editorial min-w-[640px]">
              <thead className="bg-[#F9F8F6] border-b border-[#E8E5DF] text-[#6E6A62] uppercase">
                <tr>
                  <th className="py-3 px-4">Subscriber Email</th>
                  <th className="py-3 px-4">Edition</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Subscribed Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DF]">
                {filteredSubscribers.map((sub) => {
                  const status = sub.status || 'active';
                  return (
                    <tr key={sub.id} className="hover:bg-[#FAF9F6]">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#111110]">{sub.email}</div>
                        {sub.verifiedAt && (
                          <div className="text-[10px] text-[#16A34A] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified on {new Date(sub.verifiedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[#55524B]">
                        {sub.edition || 'Weekly'}
                      </td>
                      <td className="py-3.5 px-4">
                        {status === 'active' && (
                          <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] text-[10px] rounded-xs uppercase font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Active</span>
                          </span>
                        )}
                        {status === 'pending' && (
                          <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10px] rounded-xs uppercase font-bold inline-flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Pending Confirmation</span>
                          </span>
                        )}
                        {status === 'unsubscribed' && (
                          <span className="px-2 py-0.5 bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB] text-[10px] rounded-xs uppercase font-bold inline-flex items-center gap-1">
                            <UserX className="w-2.5 h-2.5" />
                            <span>Unsubscribed</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#6E6A62]">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end whitespace-nowrap">
                          {status !== 'active' && (
                            <button
                              onClick={() => handleStatusChange(sub.id, 'active')}
                              title="Set Active"
                              className="p-1.5 text-[#16A34A] hover:bg-[#F0FDF4] rounded-xs border border-transparent hover:border-[#86EFAC]"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {status !== 'unsubscribed' && (
                            <button
                              onClick={() => handleStatusChange(sub.id, 'unsubscribed')}
                              title="Unsubscribe reader"
                              className="p-1.5 text-[#6E6A62] hover:bg-[#F3F4F6] rounded-xs border border-transparent hover:border-[#E5E7EB]"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                            title="Delete permanently"
                            className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-xs border border-transparent hover:border-[#FCA5A5]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredSubscribers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#8E8A81]">
                      {searchQuery
                        ? 'No subscribers matching your query.'
                        : 'No subscribers recorded in this category.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E5DF] pb-2 text-xs font-mono-editorial gap-1">
                <div>
                  <span className="font-bold text-[#111110]">{sub.name}</span>
                  <span className="text-[#6E6A62] ml-2">&lt;{sub.email}&gt;</span>
                </div>
                <span className="text-[#8E8A81]">
                  {new Date(sub.submittedAt).toLocaleString()}
                </span>
              </div>
              <div className="font-serif-editorial font-bold text-base text-[#111110]">
                {sub.subject}
              </div>
              <p className="text-sm text-[#55524B] leading-relaxed bg-[#F9F8F6] p-3 rounded-xs border border-[#E8E5DF]">
                {sub.message}
              </p>
              <div className="flex items-center justify-end gap-2 text-xs font-mono-editorial">
                <button
                  onClick={() => handleUpdateContactStatus(sub.id, 'read')}
                  className={`px-2.5 py-1 rounded-xs ${
                    sub.status === 'read' ? 'bg-[#111110] text-white' : 'bg-[#F9F8F6] text-[#55524B]'
                  }`}
                >
                  Mark Read
                </button>
                <button
                  onClick={() => handleUpdateContactStatus(sub.id, 'replied')}
                  className={`px-2.5 py-1 rounded-xs ${
                    sub.status === 'replied' ? 'bg-[#16A34A] text-white' : 'bg-[#F9F8F6] text-[#55524B]'
                  }`}
                >
                  Mark Replied
                </button>
              </div>
            </div>
          ))}

          {submissions.length === 0 && (
            <div className="py-16 text-center text-[#8E8A81] bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs">
              No reader contact submissions yet.
            </div>
          )}
        </div>
      )}

      {/* Delete Subscriber Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(subscriberToDelete)}
        title="Remove Subscriber"
        message={
          subscriberToDelete
            ? `Are you sure you want to remove ${subscriberToDelete.email} from the subscriber ledger? They will no longer receive weekly editorial dispatches.`
            : ''
        }
        confirmLabel="Remove Subscriber"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteSubscriber}
        onClose={() => setSubscriberToDelete(null)}
      />

      {/* Broadcast Newsletter Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={showBroadcastConfirm}
        title="Broadcast Latest Dispatch"
        message={`Send a newsletter dispatch with your latest published story to ${
          subscribers.filter((s) => (s.status || 'active') === 'active').length
        } active subscriber(s)?`}
        confirmLabel="Send Broadcast"
        cancelLabel="Cancel"
        variant="warning"
        isLoading={broadcasting}
        onConfirm={handleConfirmBroadcast}
        onClose={() => setShowBroadcastConfirm(false)}
      />
    </div>
  );
};
