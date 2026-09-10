import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { useMagazine } from '../../context/MagazineContext';

export const AdminTrash: React.FC = () => {
  const { refreshArticles } = useMagazine();
  const [trashItems, setTrashItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadTrash = async () => {
    setIsLoading(true);
    try {
      const items = await api.getTrash();
      setTrashItems(items);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load trash items.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async (id: string, title?: string) => {
    try {
      await api.restoreTrashItem(id);
      setFeedback({
        type: 'success',
        message: `Successfully restored "${title || 'Item'}" back to publication!`,
      });
      loadTrash();
      refreshArticles();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Restore failed.' });
    }
  };

  const handlePurge = async (id: string, title?: string) => {
    if (!window.confirm(`Permanently destroy "${title || 'this item'}"? This action CANNOT be undone.`)) {
      return;
    }
    try {
      await api.purgeTrashItem(id);
      setFeedback({ type: 'success', message: 'Item permanently purged from database.' });
      loadTrash();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Purge failed.' });
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Empty entire Trash? All deleted dispatches and web items will be permanently erased.')) {
      return;
    }
    try {
      const res = await api.emptyTrash();
      setFeedback({ type: 'success', message: res.message || 'Trash emptied successfully.' });
      loadTrash();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to empty trash.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-editorial uppercase font-bold text-[#DC2626] mb-1">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Soft-Deletion & Disaster Recovery Vault</span>
          </div>
          <h1 className="font-serif-editorial text-2xl font-semibold text-[#111110]">
            Editorial Trash & Recovery ({trashItems.length})
          </h1>
          <p className="text-xs text-[#6E6A62] mt-0.5">
            Deleted dispatches and layout items are safely held here for recovery. Permanent deletion requires owner authorization.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadTrash}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F9F8F6] border border-[#E8E5DF] hover:bg-[#F4F1EA] text-xs font-mono-editorial rounded-xs text-[#2C2A26] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {trashItems.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Empty Trash</span>
            </button>
          )}
        </div>
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

      {/* Trash list */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs overflow-hidden">
        {trashItems.length === 0 ? (
          <div className="py-16 text-center text-[#8C827A] space-y-2">
            <Trash2 className="w-8 h-8 mx-auto text-[#D4CFC4]" />
            <p className="font-serif-editorial text-base text-[#111110]">Trash vault is empty</p>
            <p className="text-xs font-mono-editorial text-[#8C827A]">
              All published and draft dispatches are currently active.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E5DF]">
            {trashItems.map((item) => {
              const data = item.data || {};
              const title = data.title || data.label || 'Untitled Record';
              const itemType = item.itemType || 'ARTICLE';

              return (
                <div
                  key={item.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FDFCFB] transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] rounded-xs shrink-0 mt-0.5">
                      {itemType === 'ARTICLE' ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <Layers className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif-editorial font-semibold text-base text-[#111110]">
                          {title}
                        </span>
                        <span className="bg-[#F4F1EA] text-[#6E6A62] text-[10px] font-mono-editorial uppercase px-1.5 py-0.2 rounded-xs border border-[#E8E5DF]">
                          {itemType}
                        </span>
                      </div>
                      <p className="text-xs text-[#6E6A62] line-clamp-1 mt-0.5">
                        {data.deck || data.description || 'Deleted from platform'}
                      </p>
                      <div className="text-[11px] text-[#8C827A] font-mono-editorial mt-1">
                        Deleted by <span className="font-semibold">{item.deletedBy || 'Editor'}</span> on{' '}
                        {new Date(item.deletedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRestore(item.id, title)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] hover:bg-[#DCFCE7] text-[#166534] text-xs font-semibold rounded-xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => handlePurge(item.id, title)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] text-[#991B1B] text-xs font-semibold rounded-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
