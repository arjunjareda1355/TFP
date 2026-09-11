import React, { ReactNode, useState } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { Key, ExternalLink, ArrowRight, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

export function isValidClerkPublishableKey(key?: string | null): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (!trimmed.startsWith('pk_test_') && !trimmed.startsWith('pk_live_')) return false;

  const raw = trimmed.replace(/^pk_(test|live)_/, '').replace(/\$$/, '');
  if (!raw || raw.length < 8) return false;

  try {
    const decoded = atob(raw);
    if (!decoded || !decoded.includes('.')) return false;
    // Reject dummy/example placeholder domains that do not exist on DNS
    if (
      decoded.includes('example.clerk.accounts.dev') ||
      decoded.includes('clerk.example.') ||
      decoded === 'example.com' ||
      decoded.startsWith('example.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const LIVE_PRODUCTION_KEY = 'pk_live_Y2xlcmsuZm9sZGVkcGFnZS5pbiQ';
export const DEV_TEST_KEY = 'pk_test_c21vb3RoLXdhaG9vLTExNTEuY2xlcmsuYWNjb3VudHMuZGV2JA';

export function isProductionDomain(): boolean {
  if (typeof window === 'undefined' || !window.location) return false;
  const hostname = window.location.hostname.toLowerCase();
  return hostname === 'foldedpage.in' || hostname.endsWith('.foldedpage.in');
}

export function isKeyAllowedForHost(key?: string | null): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (!isValidClerkPublishableKey(trimmed)) return false;

  // Development keys (pk_test_...) are universally permitted on all hosts (localhost, run.app, preview, etc.)
  if (trimmed.startsWith('pk_test_')) {
    return true;
  }

  // Production keys (pk_live_...) are strictly locked by Clerk to foldedpage.in
  if (trimmed.startsWith('pk_live_')) {
    if (typeof window === 'undefined' || !window.location) return true;
    const hostname = window.location.hostname.toLowerCase();
    try {
      const raw = trimmed.replace(/^pk_live_/, '').replace(/\$$/, '');
      const decoded = atob(raw).replace(/\$$/, '').toLowerCase();
      const baseDomain = decoded.replace(/^clerk\./, '');
      return hostname === baseDomain || hostname.endsWith(`.${baseDomain}`);
    } catch {
      return false;
    }
  }

  return false;
}

export function resolveInitialKey(): string {
  // 1. Check local storage
  try {
    const stored = localStorage.getItem('clerk_publishable_key');
    if (stored) {
      if (isKeyAllowedForHost(stored)) {
        return stored.trim();
      } else {
        // Clear stored key if it is not valid for this hostname (e.g. live key on dev domain)
        localStorage.removeItem('clerk_publishable_key');
      }
    }
  } catch {}

  // 2. Check query string override (?clerk=live or ?clerk=test)
  if (typeof window !== 'undefined' && window.location) {
    try {
      const params = new URLSearchParams(window.location.search);
      const paramKey = params.get('clerk') || params.get('clerk_key');
      if (paramKey === 'live' && isKeyAllowedForHost(LIVE_PRODUCTION_KEY)) {
        return LIVE_PRODUCTION_KEY;
      }
      if (paramKey === 'test') {
        return DEV_TEST_KEY;
      }
      if (paramKey && isValidClerkPublishableKey(paramKey) && isKeyAllowedForHost(paramKey)) {
        return paramKey;
      }
    } catch {}
  }

  // 3. Environment variables
  const envNextPublic =
    (typeof import.meta !== 'undefined' &&
      (import.meta as any).env &&
      (import.meta as any).env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) ||
    '';
  const envVite =
    (typeof import.meta !== 'undefined' &&
      (import.meta as any).env &&
      (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY) ||
    '';
  const envClerk =
    (typeof import.meta !== 'undefined' &&
      (import.meta as any).env &&
      (import.meta as any).env.CLERK_PUBLISHABLE_KEY) ||
    '';

  if (envNextPublic && isKeyAllowedForHost(envNextPublic)) return envNextPublic.trim();
  if (envVite && isKeyAllowedForHost(envVite)) return envVite.trim();
  if (envClerk && isKeyAllowedForHost(envClerk)) return envClerk.trim();

  // 4. Default: Use the fully configured key (Google OAuth, Email/Password, Public Sign Up enabled)
  // which works universally on both preview/vercel links and custom domains (foldedpage.in).
  return DEV_TEST_KEY;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  onResetKey: () => void;
  onFallbackToDevKey: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  isDomainError: boolean;
}

class ClerkErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
    isDomainError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const msg = error?.message || 'Clerk initialization notice';
    const isDomain =
      msg.includes('Production Keys are only allowed for domain') ||
      msg.includes('HTTP Origin header') ||
      msg.includes('origin_invalid');
    return { hasError: true, errorMessage: msg, isDomainError: isDomain };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ClerkProvider Error caught:', error, errorInfo);
    const msg = error?.message || '';
    if (
      msg.includes('Production Keys are only allowed for domain') ||
      msg.includes('HTTP Origin header') ||
      msg.includes('origin_invalid')
    ) {
      console.warn('[Clerk] Domain restriction detected; switching to dev key.');
      this.props.onFallbackToDevKey();
      this.setState({ hasError: false, errorMessage: '', isDomainError: false });
    }
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F9F8F6] flex flex-col justify-center items-center px-4 py-12 select-none">
          <div className="w-full max-w-md bg-white border border-[#E8E5DF] rounded-xs shadow-md p-6 sm:p-8">
            <div className="text-center mb-6 pb-5 border-b border-[#E8E5DF]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#EA580C] mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-mono-editorial uppercase text-[#8E8A81] tracking-widest mb-1">
                Authentication System Notice
              </div>
              <h1 className="font-serif-editorial text-2xl font-bold text-[#111110]">
                Clerk Authentication Notice
              </h1>
              <p className="font-serif-editorial italic text-xs text-[#DC2626] mt-2">
                {this.state.errorMessage}
              </p>
            </div>

            <p className="text-xs text-[#55524B] leading-relaxed mb-6">
              {this.state.isDomainError
                ? 'Production keys are domain-restricted by Clerk to foldedpage.in. In preview or development environments, click below to use the development key.'
                : 'The publication authentication service encountered a connection notice. You can retry the connection, update the Clerk publishable key, or continue reading the live publication.'}
            </p>

            <div className="space-y-2.5">
              {this.state.isDomainError ? (
                <button
                  onClick={() => {
                    this.setState({ hasError: false, errorMessage: '', isDomainError: false });
                    this.props.onFallbackToDevKey();
                  }}
                  className="w-full py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-mono-editorial uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Switch to Development Key</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    this.setState({ hasError: false, errorMessage: '', isDomainError: false });
                  }}
                  className="w-full py-2.5 bg-[#111110] hover:bg-[#EA580C] text-white text-xs font-mono-editorial uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>
              )}

              <button
                onClick={() => {
                  this.setState({ hasError: false, errorMessage: '', isDomainError: false });
                  this.props.onResetKey();
                }}
                className="w-full py-2 bg-transparent hover:bg-[#F5F4F0] text-[#111110] border border-[#E8E5DF] text-xs font-mono-editorial uppercase tracking-wider font-medium rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Update Clerk Key</span>
              </button>

              <button
                onClick={() => {
                  window.location.hash = '/';
                  this.setState({ hasError: false, errorMessage: '', isDomainError: false });
                }}
                className="w-full py-2 text-[#6E6A62] hover:text-[#111110] text-xs font-mono-editorial inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Live Magazine</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ClerkAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeKey, setActiveKey] = useState<string>(() => resolveInitialKey());
  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);

  // Handle global unhandled errors / promise rejections caused by Clerk script load or domain restrictions
  React.useEffect(() => {
    const handleScriptError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const reason = 'reason' in event ? event.reason : event.error;
      const message =
        (reason && (reason.message || String(reason))) ||
        ('message' in event ? event.message : '');
      const code =
        reason && typeof reason === 'object' && 'code' in reason
          ? (reason as any).code
          : '';

      if (
        code === 'failed_to_load_clerk_js_timeout' ||
        message.includes('failed_to_load_clerk_js') ||
        message.includes('Failed to load Clerk') ||
        message.includes('clerk.browser.js') ||
        message.includes('clerk.accounts.dev') ||
        message.includes('Production Keys are only allowed for domain') ||
        message.includes('HTTP Origin header') ||
        message.includes('origin_invalid')
      ) {
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        console.warn('[Clerk] Notice handled gracefully:', message);

        // If domain error happened, automatically fallback to test key
        if (
          message.includes('Production Keys are only allowed for domain') ||
          message.includes('HTTP Origin header') ||
          message.includes('origin_invalid')
        ) {
          try {
            localStorage.removeItem('clerk_publishable_key');
          } catch {}
          setActiveKey(DEV_TEST_KEY);
        }
      }
    };

    window.addEventListener('error', handleScriptError);
    window.addEventListener('unhandledrejection', handleScriptError);
    return () => {
      window.removeEventListener('error', handleScriptError);
      window.removeEventListener('unhandledrejection', handleScriptError);
    };
  }, []);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    if (!cleanKey) {
      setErrorMsg('Please enter a valid Clerk publishable key');
      return;
    }
    if (!isValidClerkPublishableKey(cleanKey)) {
      setErrorMsg('Publishable key must be a valid Clerk key from your dashboard (e.g. pk_live_... or pk_test_...)');
      return;
    }

    if (!isKeyAllowedForHost(cleanKey)) {
      setErrorMsg(
        'Notice: Production keys (pk_live_...) can only be used on domain "foldedpage.in". For this development/preview URL, please use your test key (pk_test_...).'
      );
      return;
    }

    try {
      localStorage.setItem('clerk_publishable_key', cleanKey);
    } catch {}
    setActiveKey(cleanKey);
    setIsUpdatingKey(false);
    setErrorMsg('');
  };

  const handleReset = () => {
    setIsUpdatingKey(true);
  };

  const handleFallbackToDevKey = () => {
    try {
      localStorage.removeItem('clerk_publishable_key');
    } catch {}
    setActiveKey(DEV_TEST_KEY);
  };

  // The publishable key used to initialize ClerkProvider
  const resolvedKey = isKeyAllowedForHost(activeKey) ? activeKey : resolveInitialKey();

  // If user requested to explicitly update the Clerk key
  if (isUpdatingKey) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex flex-col justify-center items-center px-4 py-12 select-none">
        <div className="w-full max-w-md bg-white border border-[#E8E5DF] rounded-xs shadow-md p-6 sm:p-8">
          <div className="text-center mb-6 pb-5 border-b border-[#E8E5DF]">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#EA580C] mb-3">
              <Key className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-mono-editorial uppercase text-[#8E8A81] tracking-widest mb-1">
              Clerk Authentication Setup
            </div>
            <h1 className="font-serif-editorial text-2xl font-bold text-[#111110]">
              The Folded Page
            </h1>
            <p className="font-serif-editorial italic text-xs text-[#6E6A62] mt-1">
              Active Publishable Key: <code className="font-mono font-semibold text-[#111110]">{resolvedKey.slice(0, 16)}...</code>
            </p>
          </div>

          <form onSubmit={handleSaveKey} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono-editorial uppercase text-[#55524B] mb-1 font-semibold">
                New Clerk Publishable Key
              </label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="pk_live_... or pk_test_..."
                className="w-full text-xs font-mono px-3 py-2 border border-[#E8E5DF] rounded-xs bg-[#F9F8F6] focus:bg-white focus:border-[#EA580C] outline-none"
                required
              />
              {errorMsg && <p className="text-[11px] text-red-600 mt-1 leading-snug">{errorMsg}</p>}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsUpdatingKey(false)}
                className="flex-1 py-2 bg-transparent hover:bg-[#F5F4F0] text-[#55524B] border border-[#E8E5DF] text-xs font-mono-editorial uppercase font-medium rounded-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#111110] hover:bg-[#EA580C] text-white text-xs font-mono-editorial uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Save Key</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E8E5DF] text-center space-y-2">
            <p className="text-[11px] text-[#6E6A62]">
              Copy your Publishable key from your Clerk Dashboard:
            </p>
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#EA580C] hover:underline font-mono-editorial font-semibold"
            >
              <span>dashboard.clerk.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Official ClerkProvider instance wrapped in ErrorBoundary (loads from Clerk CDN directly)
  return (
    <ClerkErrorBoundary onResetKey={handleReset} onFallbackToDevKey={handleFallbackToDevKey}>
      <ClerkProvider
        publishableKey={resolvedKey}
        appearance={{
          variables: {
            colorPrimary: '#EA580C',
            colorText: '#111110',
            colorBackground: '#FFFFFF',
            fontFamily: '"Newsreader", "Playfair Display", Georgia, serif',
            borderRadius: '2px',
          },
        }}
      >
        {children}
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
};
