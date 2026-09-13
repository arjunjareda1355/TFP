import React, { useState, useEffect } from 'react';
import {
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Shield,
  Plus,
  Trash2,
  RefreshCw,
  Code2,
  Terminal,
  ExternalLink,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  Send,
  Zap,
  Activity,
  Play,
  HelpCircle,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { ApiKey, UserRole } from '../../types';
import { useMagazine } from '../../context/MagazineContext';
import { useToast } from '../../context/ToastContext';

export const AdminApiKeys: React.FC = () => {
  const { currentUser, isOwner } = useMagazine();
  const toast = useToast();

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [revealedKeyId, setRevealedKeyId] = useState<string | null>(null);

  // New Key Modal state
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRole, setNewKeyRole] = useState<UserRole>('EDITORIAL_OWNER');
  const [newKeyDesc, setNewKeyDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In-app Action Confirmation (replaces blocked browser confirm)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'revoke' | 'delete';
    id: string;
    name: string;
  } | null>(null);
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  // Live Test API Key state
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    isOpen: boolean;
    keyName: string;
    keyString: string;
    loading: boolean;
    data?: any;
  } | null>(null);

  // Prompt & Integration Guide Modal
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Active Code Tab
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [activeDocEndpoint, setActiveDocEndpoint] = useState<'publish' | 'create' | 'update' | 'unpublish' | 'list'>('publish');

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const keys = await api.getApiKeys();
      setApiKeys(keys);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCopyKey = async (key: string, id: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(key);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      // Safe fallback for iframe sandbox
      try {
        const textarea = document.createElement('textarea');
        textarea.value = key;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (e) {
        console.warn('Fallback copy failed', e);
      }
    }
    setCopiedKeyId(id);
    toast.success('API Key copied to clipboard');
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.error('Please provide a name for this API key');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createApiKey({
        name: newKeyName.trim(),
        role: newKeyRole,
        description: newKeyDesc.trim(),
        scopes: [
          'articles.view',
          'articles.create',
          'articles.edit',
          'articles.publish',
          'articles.unpublish',
          'articles.archive',
          'articles.delete',
          'articles.manage_categories',
          'media.view',
          'media.upload',
        ],
      });
      setApiKeys((prev) => [created, ...prev]);
      setIsCreatingKey(false);
      setNewKeyName('');
      setNewKeyDesc('');
      setRevealedKeyId(created.id);
      toast.success('New API key generated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmActionExecute = async () => {
    if (!confirmAction) return;
    setIsPerformingAction(true);
    try {
      if (confirmAction.type === 'revoke') {
        await api.revokeApiKey(confirmAction.id);
        setApiKeys((prev) =>
          prev.map((k) => (k.id === confirmAction.id ? { ...k, status: 'REVOKED' } : k))
        );
        toast.success(`API key "${confirmAction.name}" revoked.`);
      } else if (confirmAction.type === 'delete') {
        await api.deleteApiKey(confirmAction.id);
        setApiKeys((prev) => prev.filter((k) => k.id !== confirmAction.id));
        toast.success(`API key "${confirmAction.name}" deleted.`);
      }
      setConfirmAction(null);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${confirmAction.type} API key`);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleTestKey = async (keyString: string, keyName: string, id: string) => {
    setTestingKeyId(id);
    setTestResult({
      isOpen: true,
      keyName,
      keyString,
      loading: true,
    });

    try {
      const result = await api.testApiKey(keyString);
      setTestResult({
        isOpen: true,
        keyName,
        keyString,
        loading: false,
        data: result,
      });
      if (result.valid) {
        toast.success(`API Key "${keyName}" is verified & active!`);
      } else {
        toast.error(`API Key verification failed: ${result.error || 'Invalid key'}`);
      }
    } catch (err: any) {
      setTestResult({
        isOpen: true,
        keyName,
        keyString,
        loading: false,
        data: { valid: false, error: err.message || 'Network request failed' },
      });
      toast.error('Test request failed.');
    } finally {
      setTestingKeyId(null);
    }
  };

  // Primary active key
  const fallbackKey: ApiKey = {
    id: 'key-master-editorial-live',
    name: 'External Editorial & Publishing Controller Key',
    key: 'tfp_live_ed7a94f83b26c19a4e21d50c77',
    role: 'EDITORIAL_OWNER',
    scopes: [
      'articles.view',
      'articles.create',
      'articles.edit',
      'articles.publish',
      'articles.unpublish',
      'articles.archive',
      'articles.delete',
    ],
    createdBy: 'system@thefoldedpage.press',
    createdAt: '2026-09-05T12:00:00.000Z',
    lastUsedAt: null,
    status: 'ACTIVE',
    description: 'Master API key for external apps to control dispatches and editorial functions.',
  };

  const activeMasterKey: ApiKey =
    apiKeys.find((k) => k.status === 'ACTIVE') || apiKeys[0] || fallbackKey;

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://thefoldedpage.press/api';

  const readyToPastePrompt = `### The Folded Page - External Publishing API Configuration

Here is the active API key and endpoint configuration for The Folded Page publishing platform:

- **Base API URL**: ${baseUrl}
- **API Key**: ${activeMasterKey.key}
- **Authentication Header**: 
  - \`x-api-key: ${activeMasterKey.key}\`
  - OR \`Authorization: Bearer ${activeMasterKey.key}\`
- **Supported Query Parameter**: \`?apiKey=${activeMasterKey.key}\`
- **Granted Permissions**: Full Editorial Owner (create, edit, publish, unpublish, archive, delete dispatches)

#### Core Endpoints:
1. **Verify / Ping Connection**:
   - \`GET ${baseUrl}/api-keys/test\`
2. **List Articles & Dispatches**:
   - \`GET ${baseUrl}/articles\`
3. **Create New Dispatch Draft**:
   - \`POST ${baseUrl}/articles\`
   - Body: \`{ "title": "My Article", "category": "Essays & Stories", "excerpt": "Brief summary", "status": "DRAFT" }\`
4. **Publish Dispatch Immediately**:
   - \`POST ${baseUrl}/articles/{id}/publish\`
5. **Update Existing Dispatch**:
   - \`PUT ${baseUrl}/articles/{id}\`
6. **Unpublish Back to Draft**:
   - \`POST ${baseUrl}/articles/{id}/unpublish\`
7. **Delete Dispatch**:
   - \`DELETE ${baseUrl}/articles/{id}\`

Please connect to this API, send the authentication header, and integrate the publishing workflow directly.`;

  const handleCopyPrompt = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(readyToPastePrompt);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = readyToPastePrompt;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (e) {
        console.warn('Fallback copy failed', e);
      }
    }
    setCopiedPrompt(true);
    toast.success('Ready-to-paste prompt copied to clipboard!');
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-editorial uppercase font-bold text-[#EA580C] mb-1">
            <Key className="w-4 h-4" />
            <span>Programmatic API Access & Integration</span>
          </div>
          <h1 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#111110]">
            API Keys & Editorial Control
          </h1>
          <p className="font-serif-editorial italic text-sm text-[#6E6A62] mt-1">
            Authorize external apps and headless microservices to control dispatches, drafts, and publication cycles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchKeys}
            className="p-2.5 bg-[#FFFFFF] border border-[#E8E5DF] hover:bg-[#FAF9F6] text-[#6E6A62] rounded-xs transition-colors"
            title="Refresh keys"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreatingKey(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EA580C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#C2410C] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New API Key</span>
          </button>
        </div>
      </div>

      {/* Primary Key Spotlight */}
      <div className="bg-[#FFFFFF] border-2 border-[#EA580C] rounded-xs p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-[#EA580C] text-white text-[10px] font-mono-editorial font-bold px-3 py-1 uppercase tracking-wider rounded-bl-xs">
          Ready to Use in External App
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#EA580C]/10 border border-[#EA580C] flex items-center justify-center text-[#EA580C] shrink-0">
            <Key className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif-editorial text-lg font-bold text-[#111110]">
                {activeMasterKey.name || 'External Editorial & Publishing Controller Key'}
              </h2>
              <span className="bg-[#16A34A] text-white text-[10px] font-mono-editorial font-bold px-2 py-0.5 rounded-xs uppercase">
                ● ACTIVE
              </span>
              <span className="bg-[#111110] text-white text-[10px] font-mono-editorial font-bold px-2 py-0.5 rounded-xs uppercase">
                EDITORIAL OWNER PRIVILEGES
              </span>
            </div>

            <p className="text-xs text-[#55524B] mt-1 font-sans-editorial">
              This API key has full editorial authorization to <strong>create</strong>, <strong>edit</strong>, <strong>publish</strong>, <strong>unpublish</strong>, <strong>archive</strong>, and <strong>delete</strong> articles and dispatches from external applications.
            </p>

            {/* Secret Key Display Box */}
            <div className="mt-4 bg-[#FAF9F6] border border-[#E8E5DF] rounded-xs p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-[11px] font-mono-editorial font-bold uppercase text-[#8E8A81] shrink-0">
                  API Key:
                </span>
                <code className="font-mono-editorial text-xs sm:text-sm font-bold text-[#111110] bg-[#FFFFFF] px-2.5 py-1.5 rounded-xs border border-[#E8E5DF] select-all truncate flex-1">
                  {revealedKeyId === activeMasterKey.id || revealedKeyId === 'primary'
                    ? activeMasterKey.key
                    : activeMasterKey.key.substring(0, 12) + '••••••••••••••••••••••••••••'}
                </code>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => handleTestKey(activeMasterKey.key, activeMasterKey.name || 'Primary Key', activeMasterKey.id || 'primary')}
                  disabled={testingKeyId === (activeMasterKey.id || 'primary')}
                  className="px-3.5 py-1.5 bg-[#F0FDF4] border border-[#86EFAC] text-[#15803D] hover:bg-[#DCFCE7] text-xs font-mono-editorial font-bold rounded-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Test API Key Connectivity"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${testingKeyId === (activeMasterKey.id || 'primary') ? 'animate-spin' : ''}`} />
                  <span>{testingKeyId === (activeMasterKey.id || 'primary') ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <button
                  onClick={() => setIsPromptModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#FFF7ED] border border-[#FDBA74] text-[#C2410C] hover:bg-[#FFEDD5] text-xs font-mono-editorial font-bold rounded-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Ready-to-paste Prompt & Integration Steps"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ready-to-Paste Prompt</span>
                </button>

                <button
                  onClick={() =>
                    setRevealedKeyId(
                      revealedKeyId === activeMasterKey.id || revealedKeyId === 'primary' ? null : 'primary'
                    )
                  }
                  className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E8E5DF] text-[#6E6A62] hover:text-[#111110] text-xs font-mono-editorial rounded-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  {revealedKeyId === activeMasterKey.id || revealedKeyId === 'primary' ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Reveal</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopyKey(activeMasterKey.key, activeMasterKey.id || 'primary')}
                  className="px-4 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {copiedKeyId === (activeMasterKey.id || 'primary') ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Key</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono-editorial text-[#8E8A81] flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span>Created by: <strong>{activeMasterKey.createdBy || 'Authorized Publisher'}</strong></span>
                <span>
                  Last Used:{' '}
                  <strong>
                    {activeMasterKey.lastUsedAt
                      ? new Date(activeMasterKey.lastUsedAt).toLocaleString()
                      : 'Not yet recorded (Ready for requests)'}
                  </strong>
                </span>
              </div>
              <span className="text-[#16A34A] font-bold">CORS Enabled • Cross-Origin Supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* All API Keys Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs overflow-hidden">
        <div className="p-4 bg-[#FAF9F6] border-b border-[#E8E5DF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#EA580C]" />
            <h3 className="font-serif-editorial font-bold text-sm text-[#111110]">
              Authorized API Credentials ({apiKeys.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono-editorial text-[#8E8A81]">
            Scoped with article authoring and publishing permissions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans-editorial min-w-[700px]">
            <thead className="bg-[#F9F8F6] text-[#6E6A62] font-mono-editorial text-[11px] uppercase border-b border-[#E8E5DF]">
              <tr>
                <th className="py-3 px-4 font-medium">Key Name / Scope</th>
                <th className="py-3 px-4 font-medium">Credential Token</th>
                <th className="py-3 px-4 font-medium">Role Granted</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Last Active</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF]">
              {apiKeys.map((item) => {
                const isRevealed = revealedKeyId === item.id;
                const isCopied = copiedKeyId === item.id;
                return (
                  <tr key={item.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-serif-editorial font-bold text-sm text-[#111110]">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[#8E8A81] mt-0.5">
                        {item.description || 'Full editorial & publishing controls'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono-editorial text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-[#FAF9F6] px-2 py-1 rounded-xs border border-[#E8E5DF] text-[#111110] font-semibold">
                          {isRevealed
                            ? item.key
                            : item.key.substring(0, 10) + '••••••••••••••••••••'}
                        </span>
                        <button
                          onClick={() => setRevealedKeyId(isRevealed ? null : item.id)}
                          className="p-1 text-[#8E8A81] hover:text-[#111110]"
                          title={isRevealed ? 'Hide' : 'Reveal'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block bg-[#FFF7ED] text-[#EA580C] border border-[#EA580C]/30 text-[10px] font-mono-editorial font-bold px-2 py-0.5 rounded-xs uppercase">
                        {item.role || 'EDITORIAL_OWNER'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono-editorial text-[#16A34A] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono-editorial text-[#DC2626] font-bold">
                          <AlertCircle className="w-3 h-3" /> Revoked
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] font-mono-editorial text-[#6E6A62]">
                      {item.lastUsedAt ? new Date(item.lastUsedAt).toLocaleDateString() : 'Never'}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleTestKey(item.key, item.name, item.id)}
                        disabled={testingKeyId === item.id}
                        className="p-1.5 text-[#15803D] hover:bg-[#DCFCE7] rounded-xs transition-colors inline-flex items-center"
                        title="Test & Verify API Key"
                      >
                        <Play className={`w-3.5 h-3.5 fill-current ${testingKeyId === item.id ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        onClick={() => handleCopyKey(item.key, item.id)}
                        className="p-1.5 text-[#6E6A62] hover:text-[#111110] hover:bg-[#E8E5DF] rounded-xs transition-colors inline-flex items-center"
                        title="Copy Key"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {item.status === 'ACTIVE' && (
                        <button
                          onClick={() => setConfirmAction({ type: 'revoke', id: item.id, name: item.name })}
                          className="p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded-xs transition-colors inline-flex items-center"
                          title="Revoke Key"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setConfirmAction({ type: 'delete', id: item.id, name: item.name })}
                        className="p-1.5 text-[#8E8A81] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-xs transition-colors inline-flex items-center"
                        title="Delete Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Guide & Code Samples */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-xs p-6">
        <div className="flex items-center justify-between border-b border-[#E8E5DF] pb-4 mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-editorial uppercase font-bold text-[#EA580C]">
              <Code2 className="w-4 h-4" />
              <span>Developer Integration Guide</span>
            </div>
            <h3 className="font-serif-editorial text-lg font-bold text-[#111110] mt-0.5">
              Connecting Your External App to Control Articles & Publishing
            </h3>
          </div>

          <div className="flex items-center gap-2 bg-[#F9F8F6] p-1 rounded-xs border border-[#E8E5DF]">
            <button
              onClick={() => setActiveCodeLang('curl')}
              className={`px-3 py-1 text-xs font-mono-editorial rounded-xs transition-colors ${
                activeCodeLang === 'curl' ? 'bg-[#111110] text-white font-bold' : 'text-[#6E6A62] hover:text-[#111110]'
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveCodeLang('javascript')}
              className={`px-3 py-1 text-xs font-mono-editorial rounded-xs transition-colors ${
                activeCodeLang === 'javascript' ? 'bg-[#111110] text-white font-bold' : 'text-[#6E6A62] hover:text-[#111110]'
              }`}
            >
              JavaScript / TypeScript
            </button>
            <button
              onClick={() => setActiveCodeLang('python')}
              className={`px-3 py-1 text-xs font-mono-editorial rounded-xs transition-colors ${
                activeCodeLang === 'python' ? 'bg-[#111110] text-white font-bold' : 'text-[#6E6A62] hover:text-[#111110]'
              }`}
            >
              Python
            </button>
          </div>
        </div>

        {/* Authentication Format Header Notice */}
        <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-xs p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
            <div className="text-xs text-[#55524B] leading-relaxed">
              <p className="font-bold text-[#111110] font-serif-editorial text-sm mb-1">
                How to Authenticate from your App
              </p>
              <p className="font-sans-editorial">
                You can provide the API key using either of the following HTTP headers with every request:
              </p>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 font-mono-editorial text-[11px]">
                <div className="bg-[#FFFFFF] p-2 border border-[#E8E5DF] rounded-xs">
                  <span className="text-[#8E8A81]">Option 1: Custom Header</span>
                  <div className="text-[#EA580C] font-bold mt-0.5 select-all">
                    x-api-key: {activeMasterKey.key}
                  </div>
                </div>
                <div className="bg-[#FFFFFF] p-2 border border-[#E8E5DF] rounded-xs">
                  <span className="text-[#8E8A81]">Option 2: Bearer Authorization</span>
                  <div className="text-[#2563EB] font-bold mt-0.5 select-all">
                    Authorization: Bearer {activeMasterKey.key}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8E5DF] pb-2 mb-4 overflow-x-auto text-xs font-mono-editorial">
          <button
            onClick={() => setActiveDocEndpoint('publish')}
            className={`px-3 py-1.5 rounded-xs transition-colors font-bold ${
              activeDocEndpoint === 'publish'
                ? 'bg-[#EA580C] text-white'
                : 'bg-[#FAF9F6] text-[#6E6A62] hover:bg-[#E8E5DF]'
            }`}
          >
            POST /api/articles/:id/publish
          </button>

          <button
            onClick={() => setActiveDocEndpoint('create')}
            className={`px-3 py-1.5 rounded-xs transition-colors font-bold ${
              activeDocEndpoint === 'create'
                ? 'bg-[#EA580C] text-white'
                : 'bg-[#FAF9F6] text-[#6E6A62] hover:bg-[#E8E5DF]'
            }`}
          >
            POST /api/articles (Create Draft)
          </button>

          <button
            onClick={() => setActiveDocEndpoint('update')}
            className={`px-3 py-1.5 rounded-xs transition-colors font-bold ${
              activeDocEndpoint === 'update'
                ? 'bg-[#EA580C] text-white'
                : 'bg-[#FAF9F6] text-[#6E6A62] hover:bg-[#E8E5DF]'
            }`}
          >
            PUT /api/articles/:id (Edit Content)
          </button>

          <button
            onClick={() => setActiveDocEndpoint('unpublish')}
            className={`px-3 py-1.5 rounded-xs transition-colors font-bold ${
              activeDocEndpoint === 'unpublish'
                ? 'bg-[#EA580C] text-white'
                : 'bg-[#FAF9F6] text-[#6E6A62] hover:bg-[#E8E5DF]'
            }`}
          >
            POST /api/articles/:id/unpublish
          </button>

          <button
            onClick={() => setActiveDocEndpoint('list')}
            className={`px-3 py-1.5 rounded-xs transition-colors font-bold ${
              activeDocEndpoint === 'list'
                ? 'bg-[#EA580C] text-white'
                : 'bg-[#FAF9F6] text-[#6E6A62] hover:bg-[#E8E5DF]'
            }`}
          >
            GET /api/articles (List All)
          </button>
        </div>

        {/* Code Block */}
        <div className="bg-[#111110] text-[#F9F8F6] p-4 rounded-xs font-mono-editorial text-xs overflow-x-auto relative">
          <button
            onClick={() => {
              const codeEl = document.getElementById('api-code-snippet');
              if (codeEl) {
                navigator.clipboard.writeText(codeEl.innerText);
                toast.success('Code snippet copied');
              }
            }}
            className="absolute top-3 right-3 px-2.5 py-1 bg-[#2C2A26] hover:bg-[#3E3B34] text-white text-[11px] rounded-xs inline-flex items-center gap-1 transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>Copy Code</span>
          </button>

          <pre id="api-code-snippet" className="leading-relaxed">
            {activeCodeLang === 'curl' && activeDocEndpoint === 'publish' && (
`# 1. Publish an article live to the magazine
curl -X POST "${baseUrl}/articles/story-01/publish" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${activeMasterKey.key}" \\
  -d '{
    "title": "Updated Dispatch Title (Optional Override)",
    "status": "PUBLISHED"
  }'`
            )}

            {activeCodeLang === 'curl' && activeDocEndpoint === 'create' && (
`# 2. Create a new article draft
curl -X POST "${baseUrl}/articles" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${activeMasterKey.key}" \\
  -d '{
    "title": "The Art of Slow Journalism in the Digital Era",
    "subtitle": "How human curiosity resists information exhaustion",
    "category": "Essays & Stories",
    "authorId": "author-arjun",
    "status": "DRAFT",
    "excerpt": "A deep exploration of editorial craft and mindful reading.",
    "heroImage": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&auto=format&fit=crop&q=85",
    "blocks": [
      {
        "id": "b1",
        "type": "paragraph",
        "text": "In an era of relentless algorithmic feeds, deliberate attention is a form of resistance."
      }
    ]
  }'`
            )}

            {activeCodeLang === 'curl' && activeDocEndpoint === 'update' && (
`# 3. Edit / Update existing article content
curl -X PUT "${baseUrl}/articles/story-01" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${activeMasterKey.key}" \\
  -d '{
    "title": "Revised Dispatch Title",
    "subtitle": "Updated subtitle for the print and web issue",
    "excerpt": "Updated summary of the story."
  }'`
            )}

            {activeCodeLang === 'curl' && activeDocEndpoint === 'unpublish' && (
`# 4. Unpublish an article back to draft status
curl -X POST "${baseUrl}/articles/story-01/unpublish" \\
  -H "x-api-key: ${activeMasterKey.key}"`
            )}

            {activeCodeLang === 'curl' && activeDocEndpoint === 'list' && (
`# 5. Fetch all articles (including drafts & published)
curl -X GET "${baseUrl}/articles" \\
  -H "x-api-key: ${activeMasterKey.key}"`
            )}

            {activeCodeLang === 'javascript' && activeDocEndpoint === 'publish' && (
`// Publish an article using JavaScript / TypeScript fetch
async function publishArticle(articleId) {
  const response = await fetch(\`${baseUrl}/articles/\${articleId}/publish\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${activeMasterKey.key}',
    },
    body: JSON.stringify({
      status: 'PUBLISHED',
    }),
  });

  const result = await response.json();
  console.log('Article successfully published:', result);
  return result;
}

publishArticle('story-01');`
            )}

            {activeCodeLang === 'javascript' && activeDocEndpoint === 'create' && (
`// Create a new article using JavaScript / TypeScript fetch
async function createDispatch() {
  const payload = {
    title: 'New Dispatch from External Editor App',
    category: 'Craft & Design',
    authorId: 'author-arjun',
    status: 'DRAFT', // or 'PUBLISHED'
    excerpt: 'Created seamlessly via The Folded Page External API.',
    heroImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&auto=format&fit=crop&q=85',
    blocks: [
      {
        id: 'blk-' + Date.now(),
        type: 'paragraph',
        text: 'The body text of the dispatch created through external API.'
      }
    ]
  };

  const response = await fetch('${baseUrl}/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${activeMasterKey.key}',
    },
    body: JSON.stringify(payload),
  });

  const newArticle = await response.json();
  console.log('Created Article ID:', newArticle.id);
  return newArticle;
}

createDispatch();`
            )}

            {activeCodeLang === 'javascript' && activeDocEndpoint === 'update' && (
`// Update an existing article using fetch
async function updateArticle(articleId, updates) {
  const response = await fetch(\`${baseUrl}/articles/\${articleId}\`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${activeMasterKey.key}',
    },
    body: JSON.stringify(updates),
  });

  return await response.json();
}

updateArticle('story-01', { title: 'Updated Title' });`
            )}

            {activeCodeLang === 'javascript' && activeDocEndpoint === 'unpublish' && (
`// Unpublish an article back to draft
async function unpublishArticle(articleId) {
  const response = await fetch(\`${baseUrl}/articles/\${articleId}/unpublish\`, {
    method: 'POST',
    headers: {
      'x-api-key': '${activeMasterKey.key}',
    },
  });

  return await response.json();
}`
            )}

            {activeCodeLang === 'javascript' && activeDocEndpoint === 'list' && (
`// Fetch all articles
async function getArticles() {
  const response = await fetch('${baseUrl}/articles', {
    headers: {
      'x-api-key': '${activeMasterKey.key}',
    },
  });

  const articles = await response.json();
  console.log('Articles count:', articles.length);
  return articles;
}`
            )}

            {activeCodeLang === 'python' && (
`import requests

API_URL = "${baseUrl}"
API_KEY = "${activeMasterKey.key}"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# 1. Publish Article
publish_response = requests.post(
    f"{API_URL}/articles/story-01/publish",
    headers=headers,
    json={"status": "PUBLISHED"}
)
print("Publish Status:", publish_response.status_code)

# 2. Create Article Draft
draft_payload = {
    "title": "Curated from External Python Service",
    "category": "Essays & Stories",
    "status": "DRAFT",
    "excerpt": "Dispatched programmatically."
}
create_response = requests.post(
    f"{API_URL}/articles",
    headers=headers,
    json=draft_payload
)
print("Created Article:", create_response.json())`
            )}
          </pre>
        </div>
      </div>

      {/* Create Key Modal */}
      {isCreatingKey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs max-w-md w-full p-6 shadow-xl text-left">
            <div className="flex items-center gap-2 mb-2 text-[#EA580C] font-mono-editorial text-xs uppercase font-bold">
              <Plus className="w-4 h-4" />
              <span>Generate API Key</span>
            </div>

            <h3 className="font-serif-editorial text-xl font-bold text-[#111110]">
              Create New External API Key
            </h3>

            <p className="text-xs text-[#6E6A62] mt-1 mb-5 leading-relaxed font-sans-editorial">
              Generate a unique token for an external publishing system or mobile application to manage dispatches.
            </p>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-editorial uppercase text-[#55524B] mb-1 font-bold">
                  Key Name / Application Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Custom Editor App"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E8E5DF] rounded-xs font-sans-editorial focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-editorial uppercase text-[#55524B] mb-1 font-bold">
                  Role & Authority
                </label>
                <select
                  value={newKeyRole}
                  onChange={(e) => setNewKeyRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs border border-[#E8E5DF] rounded-xs font-mono-editorial focus:outline-none focus:border-[#EA580C]"
                >
                  <option value="EDITORIAL_OWNER">EDITORIAL_OWNER (Full publishing & editing control)</option>
                  <option value="EDITOR">EDITOR (Draft and edit dispatches)</option>
                  <option value="OPERATIONS_OWNER">OPERATIONS_OWNER (Full site & publication control)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-editorial uppercase text-[#55524B] mb-1 font-bold">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Dedicated controller for publishing and editing articles"
                  value={newKeyDesc}
                  onChange={(e) => setNewKeyDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E8E5DF] rounded-xs font-sans-editorial focus:outline-none focus:border-[#EA580C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E5DF]">
                <button
                  type="button"
                  onClick={() => setIsCreatingKey(false)}
                  className="px-4 py-2 text-xs font-mono-editorial text-[#6E6A62] hover:text-[#111110] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Generating...' : 'Create Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal (Replaces browser confirm) */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs max-w-md w-full p-6 shadow-2xl text-left">
            <div className="flex items-center gap-2 mb-2 text-[#DC2626] font-mono-editorial text-xs uppercase font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Confirm {confirmAction.type === 'revoke' ? 'Revocation' : 'Permanent Deletion'}</span>
            </div>

            <h3 className="font-serif-editorial text-lg font-bold text-[#111110]">
              {confirmAction.type === 'revoke'
                ? `Revoke API Key "${confirmAction.name}"?`
                : `Permanently Delete API Key "${confirmAction.name}"?`}
            </h3>

            <p className="text-xs text-[#6E6A62] mt-2 mb-5 leading-relaxed font-sans-editorial">
              {confirmAction.type === 'revoke'
                ? 'External applications using this key will immediately lose access to create, publish, and edit dispatches. You can re-enable or generate a new key at any time.'
                : 'This token will be permanently erased from the editorial database. This action cannot be undone.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E5DF]">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={isPerformingAction}
                className="px-4 py-2 text-xs font-mono-editorial text-[#6E6A62] hover:text-[#111110] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmActionExecute}
                disabled={isPerformingAction}
                className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {isPerformingAction
                  ? 'Processing...'
                  : confirmAction.type === 'revoke'
                  ? 'Yes, Revoke Key'
                  : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live API Key Test Modal */}
      {testResult?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs max-w-lg w-full p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#15803D]" />
                <h3 className="font-serif-editorial text-base font-bold text-[#111110]">
                  API Key Health & Diagnostics
                </h3>
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="p-1 text-[#8E8A81] hover:text-[#111110] rounded-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 font-sans-editorial text-xs">
              <div className="bg-[#FAF9F6] border border-[#E8E5DF] p-3 rounded-xs flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono-editorial uppercase text-[#8E8A81] font-bold">Tested Key</div>
                  <div className="font-bold text-[#111110] text-sm mt-0.5">{testResult.keyName}</div>
                </div>
                <code className="font-mono-editorial text-[11px] bg-[#FFFFFF] px-2 py-1 border border-[#E8E5DF] rounded-xs">
                  {testResult.keyString.substring(0, 10)}••••••••
                </code>
              </div>

              {testResult.loading ? (
                <div className="py-8 text-center">
                  <div className="w-8 h-8 border-2 border-[#EA580C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="font-mono-editorial text-xs text-[#6E6A62]">
                    Validating token against `/api/api-keys/test`...
                  </p>
                </div>
              ) : testResult.data?.valid ? (
                <div className="space-y-3">
                  <div className="p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-xs flex items-center gap-2.5 text-[#15803D]">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="font-bold text-xs font-mono-editorial uppercase">
                        200 OK — Authentication Succeeded
                      </div>
                      <div className="text-[11px] text-[#166534] mt-0.5">
                        {testResult.data.message || 'The API key is active and authorized for external requests.'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#FAF9F6] p-2.5 rounded-xs border border-[#E8E5DF]">
                      <span className="text-[10px] font-mono-editorial text-[#8E8A81] uppercase block font-bold">Latency</span>
                      <span className="font-mono-editorial font-bold text-[#15803D]">{testResult.data.latencyMs} ms</span>
                    </div>
                    <div className="bg-[#FAF9F6] p-2.5 rounded-xs border border-[#E8E5DF]">
                      <span className="text-[10px] font-mono-editorial text-[#8E8A81] uppercase block font-bold">Role Granted</span>
                      <span className="font-mono-editorial font-bold text-[#111110]">{testResult.data.role || 'EDITORIAL_OWNER'}</span>
                    </div>
                  </div>

                  {testResult.data.scopes && testResult.data.scopes.length > 0 && (
                    <div className="bg-[#FAF9F6] p-3 rounded-xs border border-[#E8E5DF]">
                      <span className="text-[10px] font-mono-editorial text-[#8E8A81] uppercase block font-bold mb-1.5">
                        Active Privileges ({testResult.data.scopes.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {testResult.data.scopes.map((sc: string) => (
                          <span
                            key={sc}
                            className="bg-[#FFFFFF] text-[#111110] border border-[#E8E5DF] text-[10px] font-mono-editorial px-2 py-0.5 rounded-xs"
                          >
                            {sc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xs flex items-center gap-2.5 text-[#DC2626]">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="font-bold text-xs font-mono-editorial uppercase">
                      Authentication Failed
                    </div>
                    <div className="text-[11px] text-[#991B1B] mt-0.5">
                      {testResult.data?.error || 'The API key is invalid or revoked.'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E8E5DF] mt-5">
              <button
                type="button"
                onClick={() => handleTestKey(testResult.keyString, testResult.keyName, testResult.keyName)}
                disabled={testResult.loading}
                className="px-3 py-1.5 bg-[#FAF9F6] border border-[#E8E5DF] hover:bg-[#F0EFEB] text-[#111110] text-xs font-mono-editorial rounded-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testResult.loading ? 'animate-spin' : ''}`} />
                <span>Retest</span>
              </button>
              <button
                type="button"
                onClick={() => setTestResult(null)}
                className="px-4 py-1.5 bg-[#111110] text-white text-xs font-mono-editorial font-bold uppercase tracking-wider rounded-xs hover:bg-[#333330] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ready-to-Paste Prompt & Step-by-Step Integration Modal */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs max-w-2xl w-full p-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#EA580C]" />
                <h3 className="font-serif-editorial text-lg font-bold text-[#111110]">
                  Ready-to-Paste Prompt & App Integration Steps
                </h3>
              </div>
              <button
                onClick={() => setIsPromptModalOpen(false)}
                className="p-1 text-[#8E8A81] hover:text-[#111110] rounded-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6E6A62] mt-3 font-sans-editorial leading-relaxed">
              Copy this prompt directly into your AI coding assistant (Cursor, Copilot, ChatGPT, Claude) or external application codebase to immediately wire up publishing access.
            </p>

            {/* Ready-to-Paste Prompt Block */}
            <div className="mt-4">
              <div className="flex items-center justify-between bg-[#1C1917] text-white px-3.5 py-2 rounded-t-xs">
                <span className="text-[11px] font-mono-editorial font-bold uppercase tracking-wider text-[#D6D3D1]">
                  Copy-Paste Prompt for External App / AI Agent
                </span>
                <button
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1.5 text-xs font-mono-editorial px-2.5 py-1 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xs transition-colors"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>
              <pre className="bg-[#0C0A09] text-[#E7E5E4] p-4 text-xs font-mono-editorial whitespace-pre-wrap leading-relaxed rounded-b-xs border border-t-0 border-[#292524] select-all max-h-60 overflow-y-auto">
                {readyToPastePrompt}
              </pre>
            </div>

            {/* Clear Step-by-Step Instructions */}
            <div className="mt-6 border-t border-[#E8E5DF] pt-4">
              <h4 className="font-serif-editorial font-bold text-sm text-[#111110] mb-3">
                4-Step Guide to Adding the API to Your App:
              </h4>

              <ol className="space-y-3 font-sans-editorial text-xs text-[#55524B]">
                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EA580C]/10 text-[#EA580C] font-mono-editorial font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <div>
                    <strong className="text-[#111110]">Save the API Key:</strong> Store{' '}
                    <code className="bg-[#FAF9F6] px-1.5 py-0.5 border border-[#E8E5DF] text-[#EA580C] font-mono-editorial">
                      {activeMasterKey.key}
                    </code>{' '}
                    in your app's environment configuration (e.g., <code className="bg-[#FAF9F6] px-1 py-0.5">TFP_API_KEY</code>).
                  </div>
                </li>

                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EA580C]/10 text-[#EA580C] font-mono-editorial font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <div>
                    <strong className="text-[#111110]">Attach the Header:</strong> In every HTTP request, include either:
                    <div className="mt-1 font-mono-editorial text-[11px] bg-[#FAF9F6] p-2 rounded-xs border border-[#E8E5DF]">
                      x-api-key: {activeMasterKey.key}
                    </div>
                  </div>
                </li>

                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EA580C]/10 text-[#EA580C] font-mono-editorial font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <div>
                    <strong className="text-[#111110]">Verify Connection:</strong> Send a quick <code className="font-mono-editorial bg-[#FAF9F6] px-1 py-0.5">GET {baseUrl}/api-keys/test</code> request. A response of <code className="font-mono-editorial text-[#15803D]">"valid": true</code> confirms you are ready!
                  </div>
                </li>

                <li className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EA580C]/10 text-[#EA580C] font-mono-editorial font-bold flex items-center justify-center shrink-0 text-[11px]">
                    4
                  </span>
                  <div>
                    <strong className="text-[#111110]">Publish Articles:</strong> Send <code className="font-mono-editorial bg-[#FAF9F6] px-1 py-0.5">POST {baseUrl}/articles</code> to draft stories, and <code className="font-mono-editorial bg-[#FAF9F6] px-1 py-0.5">POST {baseUrl}/articles/:id/publish</code> to take them live on the front page immediately.
                  </div>
                </li>
              </ol>
            </div>

            <div className="flex items-center justify-end pt-5 border-t border-[#E8E5DF] mt-6">
              <button
                type="button"
                onClick={() => setIsPromptModalOpen(false)}
                className="px-5 py-2 bg-[#111110] hover:bg-[#333330] text-white text-xs font-mono-editorial font-bold uppercase tracking-wider rounded-xs transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
