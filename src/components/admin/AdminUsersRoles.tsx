import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  UserPlus,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Lock,
  Unlock,
  Key,
  Copy,
  RefreshCw,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Info,
  Edit3,
  X,
} from 'lucide-react';
import { useMagazine } from '../../context/MagazineContext';
import { api } from '../../services/api';
import { User, RoleName } from '../../types';
import { AdminConfirmDialog } from './AdminConfirmDialog';

export const AdminUsersRoles: React.FC = () => {
  const { currentUser, isOwner } = useMagazine();
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // In-app Action Confirmations (replaces blocked browser confirm)
  const [invitationToRevoke, setInvitationToRevoke] = useState<{ id: string; email: string } | null>(null);
  const [userToSuspend, setUserToSuspend] = useState<{ user: User; willSuspend: boolean } | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<RoleName>('EDITOR');
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [lastGeneratedInvite, setLastGeneratedInvite] = useState<{
    email: string;
    token: string;
    inviteUrl: string;
  } | null>(null);

  // Edit role modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleName>('EDITOR');
  const [userCustomPermissions, setUserCustomPermissions] = useState<string[]>([]);

  // Acceptance tester
  const [acceptanceToken, setAcceptanceToken] = useState('');
  const [acceptanceName, setAcceptanceName] = useState('');

  const loadUsersAndInvitations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data.users || []);
      setInvitations(data.invitations || []);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load user records.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsersAndInvitations();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      setFeedback({ type: 'error', message: 'Please provide a valid email address.' });
      return;
    }

    try {
      const res = await api.inviteUser({
        email: inviteEmail.trim(),
        name: inviteName.trim() || undefined,
        role: inviteRole,
        customPermissions: customPermissions.length > 0 ? customPermissions : undefined,
      });

      setLastGeneratedInvite({
        email: res.invitation.email,
        token: res.invitation.token,
        inviteUrl: res.inviteUrl,
      });

      setFeedback({
        type: 'success',
        message: `Invitation generated for ${res.invitation.email}. Role: ${res.invitation.role}`,
      });
      setInviteEmail('');
      setInviteName('');
      setCustomPermissions([]);
      loadUsersAndInvitations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to generate invitation.' });
    }
  };

  const handleRevokeInvitation = (id: string, email: string) => {
    setInvitationToRevoke({ id, email });
  };

  const handleConfirmRevokeInvitation = async () => {
    if (!invitationToRevoke) return;
    setIsProcessingAction(true);
    try {
      await api.revokeInvitation(invitationToRevoke.id);
      setFeedback({ type: 'success', message: `Invitation token for ${invitationToRevoke.email} revoked.` });
      setInvitationToRevoke(null);
      loadUsersAndInvitations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to revoke invitation.' });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleToggleSuspend = (user: User) => {
    const willSuspend = user.status !== 'SUSPENDED';
    setUserToSuspend({ user, willSuspend });
  };

  const handleConfirmToggleSuspend = async () => {
    if (!userToSuspend) return;
    setIsProcessingAction(true);
    const { user, willSuspend } = userToSuspend;
    try {
      await api.suspendUser(user.id, willSuspend);
      setFeedback({
        type: 'success',
        message: `User ${user.name} is now ${willSuspend ? 'suspended' : 'active'}.`,
      });
      setUserToSuspend(null);
      loadUsersAndInvitations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Action failed.' });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsProcessingAction(true);
    try {
      await api.deleteUser(userToDelete.id);
      setFeedback({ type: 'success', message: `User ${userToDelete.name} has been removed.` });
      setUserToDelete(null);
      loadUsersAndInvitations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete user.' });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleUpdateUserRole = async () => {
    if (!editingUser) return;
    try {
      await api.updateUserRole(
        editingUser.id,
        selectedRole,
        userCustomPermissions.length > 0 ? userCustomPermissions : undefined
      );
      setFeedback({
        type: 'success',
        message: `Role for ${editingUser.name} updated to ${selectedRole}.`,
      });
      setEditingUser(null);
      loadUsersAndInvitations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update role.' });
    }
  };

  const handleAcceptInvitationDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptanceToken) return;
    try {
      const res = await api.acceptInvitation(acceptanceToken.trim(), acceptanceName.trim() || undefined);
      setFeedback({
        type: 'success',
        message: `Account activated for ${res.user.name} (${res.user.role})! Token: ${res.token}`,
      });
      setAcceptanceToken('');
      setAcceptanceName('');
      loadUsersAndInvitations();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to activate invitation.' });
    }
  };

  const availablePermissions = [
    { key: 'articles.create', label: 'Create Dispatches' },
    { key: 'articles.edit_all', label: 'Edit All Dispatches' },
    { key: 'articles.publish', label: 'Publish Dispatches' },
    { key: 'articles.delete', label: 'Delete & Trash Dispatches' },
    { key: 'trash.restore', label: 'Restore from Trash' },
    { key: 'trash.purge', label: 'Permanent Purge' },
    { key: 'website.manage_social', label: 'Edit Social & Feed Links' },
    { key: 'website.manage_navigation', label: 'Edit Navigation Menu' },
    { key: 'website.manage_widgets', label: 'Edit Web Items & Widgets' },
    { key: 'website.manage_about', label: 'Edit Editorial Code & About' },
    { key: 'users.invite', label: 'Invite New Users' },
    { key: 'users.manage_roles', label: 'Manage Roles & Access' },
    { key: 'security.view_logs', label: 'View Audit Logs' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner: Dual Owner Architecture */}
      <div className="bg-[#111110] text-[#FFFFFF] border border-[#2C2A26] p-6 sm:p-8 rounded-xs shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-editorial uppercase font-bold text-[#EA580C] mb-2">
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
              <span>Dual-Owner Authority Architecture & RBAC System</span>
            </div>
            <h1 className="font-serif-editorial text-2xl sm:text-3xl font-medium tracking-tight text-white">
              Editorial & Operations Access Control
            </h1>
            <p className="text-xs sm:text-sm text-[#A8A29E] font-normal leading-relaxed mt-1 max-w-3xl">
              The Folded Page is governed by two permanent co-owners who hold autonomous authority over content integrity, publishing workflows, system operations, and team invitations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite New User</span>
            </button>
            <button
              onClick={loadUsersAndInvitations}
              className="inline-flex items-center gap-2 px-3 py-2.5 bg-[#2C2A26] hover:bg-[#3E3B34] text-[#E8E5DF] text-xs font-semibold rounded-xs transition-colors"
              title="Refresh users list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dual Owners Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#2C2A26]">
          <div className="bg-[#1C1A17] border border-[#3E3B34] p-4 rounded-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#EA580C]/20 border border-[#EA580C] flex items-center justify-center text-[#EA580C] shrink-0 font-serif-editorial font-bold text-base">
              ED
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif-editorial font-semibold text-sm text-white">Editorial Directorate</span>
                <span className="bg-[#EA580C] text-[10px] font-mono-editorial font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs text-white">
                  EDITORIAL & PUBLISHING OWNER
                </span>
              </div>
              <div className="text-xs text-[#EA580C] font-mono-editorial mt-0.5 truncate">
                editor-in-chief@thefoldedpage.press
              </div>
              <p className="text-[11px] text-[#A8A29E] mt-1 leading-snug">
                Editor-in-Chief & Publishing Owner • Content, Editorial Standards, Dispatches & Issue Releases.
              </p>
            </div>
          </div>

          <div className="bg-[#1C1A17] border border-[#3E3B34] p-4 rounded-xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#2563EB]/20 border border-[#2563EB] flex items-center justify-center text-[#60A5FA] shrink-0 font-serif-editorial font-bold text-base">
              OP
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif-editorial font-semibold text-sm text-white">Operations Directorate</span>
                <span className="bg-[#2563EB] text-[10px] font-mono-editorial font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs text-white">
                  OPERATIONS & PUBLISHING OWNER
                </span>
              </div>
              <div className="text-xs text-[#60A5FA] font-mono-editorial mt-0.5 truncate">
                publication-director@thefoldedpage.press
              </div>
              <p className="text-[11px] text-[#A8A29E] mt-1 leading-snug">
                Publication Director & Publishing Owner • User Access, Website Management, Social Links & Security.
              </p>
            </div>
          </div>
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
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Generated Invite Modal Card */}
      {lastGeneratedInvite && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] p-5 rounded-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono-editorial font-bold uppercase text-[#D97706]">
              <Sparkles className="w-4 h-4" />
              <span>Invitation Token Ready for {lastGeneratedInvite.email}</span>
            </div>
            <button
              onClick={() => setLastGeneratedInvite(null)}
              className="text-[#92400E] text-xs hover:underline font-mono-editorial"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-[#92400E]">
            Share this secure invitation token or direct activation link with the team member.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              value={lastGeneratedInvite.inviteUrl}
              className="flex-1 bg-white border border-[#FCD34D] px-3 py-2 text-xs font-mono-editorial text-[#111110] rounded-xs"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(lastGeneratedInvite.inviteUrl);
                setFeedback({ type: 'success', message: 'Invite link copied to clipboard!' });
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-semibold rounded-xs transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Team Directory */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E5DF] flex items-center justify-between">
          <div>
            <h2 className="font-serif-editorial text-lg font-semibold text-[#111110]">
              Authorized Users ({users.length})
            </h2>
            <p className="text-xs text-[#6E6A62]">
              Team members, senior editors, and contributing journalists with active platform credentials.
            </p>
          </div>
          <span className="text-xs font-mono-editorial text-[#8C827A]">
            Dual-Owner Protected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-[#F9F8F6] border-b border-[#E8E5DF] text-[#6E6A62] font-mono-editorial uppercase">
                <th className="py-3 px-6">User & Profile</th>
                <th className="py-3 px-4">Role & Authority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF]">
              {users.map((user) => {
                const isPermanent = Boolean(user.isPermanentOwner);
                const isCurrent = currentUser?.email?.toLowerCase() === user.email.toLowerCase();

                return (
                  <tr key={user.id} className="hover:bg-[#FDFCFB] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=111110&color=fff`
                          }
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#E8E5DF]"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-[#111110] flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isPermanent && <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />}
                            {isCurrent && (
                              <span className="text-[10px] bg-[#F4F1EA] text-[#8C827A] font-mono-editorial px-1.5 py-0.2 rounded-xs">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#6E6A62] font-mono-editorial">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`font-mono-editorial text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs ${
                            user.role === 'EDITORIAL_OWNER'
                              ? 'bg-[#EA580C] text-white'
                              : user.role === 'OPERATIONS_OWNER'
                              ? 'bg-[#2563EB] text-white'
                              : user.role === 'OWNER'
                              ? 'bg-[#111110] text-white'
                              : user.role === 'MANAGING_EDITOR'
                              ? 'bg-[#9333EA] text-white'
                              : user.role === 'SENIOR_EDITOR'
                              ? 'bg-[#4F46E5] text-white'
                              : 'bg-[#F4F1EA] text-[#2C2A26] border border-[#E8E5DF]'
                          }`}
                        >
                          {user.role}
                        </span>
                        {user.customPermissions && user.customPermissions.length > 0 && (
                          <span className="text-[10px] text-[#8C827A] font-mono-editorial">
                            +{user.customPermissions.length} custom permissions
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-mono-editorial font-semibold px-2 py-0.5 rounded-xs ${
                          user.status === 'SUSPENDED'
                            ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                            : 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'SUSPENDED' ? 'bg-[#DC2626]' : 'bg-[#16A34A]'
                          }`}
                        />
                        {user.status || 'ACTIVE'}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono-editorial text-xs text-[#8C827A]">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {isPermanent ? (
                        <span className="text-[11px] font-mono-editorial text-[#8C827A] italic">
                          Permanent Owner
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setSelectedRole(user.role);
                              setUserCustomPermissions(user.customPermissions || []);
                            }}
                            className="p-1.5 text-[#6E6A62] hover:text-[#111110] hover:bg-[#F4F1EA] rounded-xs transition-colors"
                            title="Edit Role & Permissions"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleSuspend(user)}
                            className="p-1.5 text-[#6E6A62] hover:text-[#D97706] hover:bg-[#FFFBEB] rounded-xs transition-colors"
                            title={user.status === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}
                          >
                            {user.status === 'SUSPENDED' ? (
                              <Unlock className="w-3.5 h-3.5 text-[#16A34A]" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-[#D97706]" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-[#6E6A62] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xs transition-colors"
                            title="Remove User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Section */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3">
          <div>
            <h3 className="font-serif-editorial text-base font-semibold text-[#111110]">
              Pending Invitations ({invitations.length})
            </h3>
            <p className="text-xs text-[#6E6A62]">
              Sent invitation tokens awaiting activation by new team members.
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="text-xs font-mono-editorial text-[#EA580C] hover:underline font-bold uppercase"
          >
            + Create New Invitation
          </button>
        </div>

        {invitations.length === 0 ? (
          <div className="py-8 text-center text-[#8C827A] font-mono-editorial text-xs">
            No pending invitations. All invited members have completed onboarding.
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-[#F9F8F6] border border-[#E8E5DF] p-3.5 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-[#111110]">
                      {inv.name || 'Invited Contributor'}
                    </span>
                    <span className="text-xs text-[#6E6A62] font-mono-editorial">({inv.email})</span>
                    <span className="bg-[#111110] text-white text-[10px] font-mono-editorial font-bold px-1.5 py-0.2 rounded-xs">
                      {inv.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#8C827A] font-mono-editorial mt-1">
                    Invited by {inv.invitedBy || 'Owner'} • Expires in{' '}
                    {Math.max(
                      0,
                      Math.round((new Date(inv.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    )}{' '}
                    days
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/#accept-invite?token=${inv.token}`;
                      navigator.clipboard.writeText(url);
                      setFeedback({ type: 'success', message: 'Invite link copied!' });
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#E8E5DF] text-xs font-mono-editorial rounded-xs hover:bg-[#F4F1EA]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={() => handleRevokeInvitation(inv.id, inv.email)}
                    className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-xs transition-colors"
                    title="Revoke Token"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Invitation Acceptance Testing Box */}
      <div className="bg-[#FAF8F5] border border-[#E8E5DF] rounded-xs p-6">
        <h3 className="font-serif-editorial text-base font-semibold text-[#111110] mb-1">
          Accept Invitation Portal Simulator
        </h3>
        <p className="text-xs text-[#6E6A62] mb-4">
          Test or simulate invitation acceptance for newly invited contributors or editors.
        </p>

        <form onSubmit={handleAcceptInvitationDirect} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Enter Invitation Token (e.g. inv-tok-...)"
            value={acceptanceToken}
            onChange={(e) => setAcceptanceToken(e.target.value)}
            className="bg-white border border-[#E8E5DF] px-3 py-2 text-xs font-mono-editorial text-[#111110] rounded-xs focus:ring-1 focus:ring-[#EA580C]"
          />
          <input
            type="text"
            placeholder="Full Name (optional)"
            value={acceptanceName}
            onChange={(e) => setAcceptanceName(e.target.value)}
            className="bg-white border border-[#E8E5DF] px-3 py-2 text-xs text-[#111110] rounded-xs focus:ring-1 focus:ring-[#EA580C]"
          />
          <button
            type="submit"
            className="bg-[#111110] hover:bg-[#2C2A26] text-white text-xs font-semibold px-4 py-2 rounded-xs transition-colors"
          >
            Activate Account
          </button>
        </form>
      </div>

      {/* INVITE NEW USER MODAL */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111110]/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-2xl max-w-lg w-full p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-[#EA580C]" />
                <h3 className="font-serif-editorial text-xl font-semibold text-[#111110]">
                  Invite Editorial Team Member
                </h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-[#8C827A] hover:text-[#111110]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-editorial uppercase font-bold text-[#6E6A62] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="editor@thefoldedpage.press"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E8E5DF] px-3 py-2 text-xs font-mono-editorial rounded-xs focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-editorial uppercase font-bold text-[#6E6A62] mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Elena Rostova"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E8E5DF] px-3 py-2 text-xs rounded-xs focus:ring-1 focus:ring-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-editorial uppercase font-bold text-[#6E6A62] mb-1">
                  Assigned Editorial Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as RoleName)}
                  className="w-full bg-[#FAF8F5] border border-[#E8E5DF] px-3 py-2 text-xs rounded-xs font-mono-editorial"
                >
                  <option value="MANAGING_EDITOR">Managing Editor (Full editorial authority)</option>
                  <option value="SENIOR_EDITOR">Senior Editor (Draft, Polish, Publish)</option>
                  <option value="EDITOR">Editor (Content creation & revision)</option>
                  <option value="CONTRIBUTOR">Staff Contributor (Drafting & field submission)</option>
                  <option value="OPERATIONS_SPECIALIST">Operations Specialist (Layout & Socials)</option>
                  <option value="MODERATOR">Moderator (Audience & inquiries)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-editorial uppercase font-bold text-[#6E6A62] mb-2">
                  Additional Custom Permissions (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs">
                  {availablePermissions.map((perm) => (
                    <label key={perm.key} className="flex items-center gap-2 text-xs text-[#2C2A26] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customPermissions.includes(perm.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCustomPermissions([...customPermissions, perm.key]);
                          } else {
                            setCustomPermissions(customPermissions.filter((p) => p !== perm.key));
                          }
                        }}
                        className="rounded text-[#EA580C] focus:ring-[#EA580C]"
                      />
                      <span className="text-[11px]">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E5DF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-mono-editorial text-[#6E6A62] hover:text-[#111110]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
                >
                  Generate Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111110]/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setEditingUser(null)}
        >
          <div
            className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-2xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-3 mb-4">
              <h3 className="font-serif-editorial text-lg font-semibold text-[#111110]">
                Modify Role for {editingUser.name}
              </h3>
              <button onClick={() => setEditingUser(null)}>
                <X className="w-4 h-4 text-[#8C827A]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono-editorial uppercase font-bold text-[#6E6A62] mb-1">
                  Assigned Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as RoleName)}
                  className="w-full bg-[#FAF8F5] border border-[#E8E5DF] px-3 py-2 text-xs rounded-xs font-mono-editorial"
                >
                  <option value="MANAGING_EDITOR">Managing Editor</option>
                  <option value="SENIOR_EDITOR">Senior Editor</option>
                  <option value="EDITOR">Editor</option>
                  <option value="CONTRIBUTOR">Contributor</option>
                  <option value="OPERATIONS_SPECIALIST">Operations Specialist</option>
                  <option value="MODERATOR">Moderator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-editorial uppercase font-bold text-[#6E6A62] mb-2">
                  Custom Permissions
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs">
                  {availablePermissions.map((perm) => (
                    <label key={perm.key} className="flex items-center gap-2 text-xs text-[#2C2A26] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userCustomPermissions.includes(perm.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserCustomPermissions([...userCustomPermissions, perm.key]);
                          } else {
                            setUserCustomPermissions(userCustomPermissions.filter((p) => p !== perm.key));
                          }
                        }}
                        className="rounded text-[#EA580C] focus:ring-[#EA580C]"
                      />
                      <span className="text-[11px]">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E5DF] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 text-xs text-[#6E6A62]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateUserRole}
                  className="px-4 py-1.5 bg-[#111110] hover:bg-[#2C2A26] text-white text-xs font-semibold rounded-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Invitation Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(invitationToRevoke)}
        title="Revoke Invitation Token"
        message={
          invitationToRevoke
            ? `Are you sure you want to revoke the invitation token for "${invitationToRevoke.email}"? The invitation link will immediately become invalid.`
            : ''
        }
        confirmLabel="Revoke Invitation"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isProcessingAction}
        onConfirm={handleConfirmRevokeInvitation}
        onClose={() => setInvitationToRevoke(null)}
      />

      {/* Toggle Suspend Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(userToSuspend)}
        title={userToSuspend?.willSuspend ? 'Suspend User Access' : 'Restore User Access'}
        message={
          userToSuspend
            ? `Are you sure you want to ${
                userToSuspend.willSuspend
                  ? 'suspend editorial and admin access for'
                  : 'reactivate access for'
              } ${userToSuspend.user.name} (${userToSuspend.user.email})?`
            : ''
        }
        confirmLabel={userToSuspend?.willSuspend ? 'Suspend User' : 'Restore Access'}
        cancelLabel="Cancel"
        variant={userToSuspend?.willSuspend ? 'warning' : 'primary'}
        isLoading={isProcessingAction}
        onConfirm={handleConfirmToggleSuspend}
        onClose={() => setUserToSuspend(null)}
      />

      {/* Delete User Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(userToDelete)}
        title="Remove User Account"
        message={
          userToDelete
            ? `Are you sure you want to permanently remove access for ${userToDelete.name} (${userToDelete.email})? Their editorial credentials will be completely revoked.`
            : ''
        }
        confirmLabel="Remove User"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isProcessingAction}
        onConfirm={handleConfirmDeleteUser}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  );
};
