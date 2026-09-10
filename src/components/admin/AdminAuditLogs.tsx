import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  User,
  Clock,
  FileText,
  Lock,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (searchQuery) filters.query = searchQuery;
      if (actionFilter) filters.action = actionFilter;
      const data = await api.getActivityLogs(filters);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-6 rounded-xs shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-editorial uppercase font-bold text-[#EA580C] mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Immutable Security Audit Log</span>
          </div>
          <h1 className="font-serif-editorial text-2xl font-semibold text-[#111110]">
            System Activity & Security Audit Trail ({logs.length})
          </h1>
          <p className="text-xs text-[#6E6A62] mt-0.5">
            Audit record of user invitations, role updates, authentication, article publishing, and site configuration changes.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F9F8F6] border border-[#E8E5DF] hover:bg-[#F4F1EA] text-xs font-mono-editorial rounded-xs text-[#2C2A26] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-4 rounded-xs shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C827A]" />
            <input
              type="text"
              placeholder="Search logs by user, email, resource or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E8E5DF] pl-9 pr-3 py-2 text-xs rounded-xs font-mono-editorial focus:ring-1 focus:ring-[#EA580C]"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-[#111110] hover:bg-[#2C2A26] text-white text-xs font-semibold rounded-xs"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8C827A]" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#FAF8F5] border border-[#E8E5DF] px-3 py-2 text-xs rounded-xs font-mono-editorial"
          >
            <option value="">All Actions</option>
            <option value="INVITE">User Invitations</option>
            <option value="ROLE">Role Updates</option>
            <option value="SUSPEND">Suspensions</option>
            <option value="DELETE">Deletions & Trashing</option>
            <option value="RESTORE">Restorations</option>
            <option value="Sign In">Sign-in Events</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-16 text-center text-[#8C827A] font-mono-editorial text-xs">
            No audit logs found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F9F8F6] border-b border-[#E8E5DF] text-[#6E6A62] font-mono-editorial uppercase">
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-6">Details</th>
                  <th className="py-3 px-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DF]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FDFCFB] transition-colors">
                    <td className="py-3.5 px-6 font-mono-editorial text-xs text-[#8C827A] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#111110]">{log.userName || log.userEmail || 'System'}</div>
                      <div className="text-[10px] text-[#8C827A] font-mono-editorial">{log.userRole || 'ANONYMOUS'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono-editorial font-semibold text-[11px] text-[#2C2A26] bg-[#F4F1EA] px-2 py-0.5 rounded-xs border border-[#E8E5DF]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-editorial text-xs text-[#6E6A62]">
                      {log.resource}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-[#403D37] max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-mono-editorial text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-xs ${
                          log.result === 'FAILURE'
                            ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                            : 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                        }`}
                      >
                        {log.result || 'SUCCESS'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
