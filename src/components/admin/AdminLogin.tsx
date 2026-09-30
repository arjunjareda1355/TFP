import React, { useState } from 'react';
import { Lock, ArrowLeft, UserCheck, UserPlus, ShieldCheck, Mail, Key, Loader2, AlertCircle } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { BrandLogo } from '../BrandLogo';
import { useMagazine } from '../../context/MagazineContext';

interface AdminLoginProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onBackToSite?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel, onBackToSite }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'direct'>('login');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loginAsAdmin } = useMagazine();

  const handleExit = onBackToSite || onCancel || (() => (window.location.hash = ''));

  const currentRedirect = typeof window !== 'undefined' && window.location.hash ? window.location.hash : '/#admin';

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }
    setLoading(true);
    try {
      await loginAsAdmin(email.trim(), passcode);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col justify-center items-center px-4 py-12 select-none">
      {/* Container with newspaper / editorial aesthetic */}
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-md p-6 sm:p-9">
        {/* Masthead Header */}
        <div className="text-center mb-6 pb-6 border-b border-[#E8E5DF]">
          <div className="flex justify-center mb-4">
            <BrandLogo variant="emblem" size={44} theme="light" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF7ED] border border-[#FED7AA] rounded-xs text-[#EA580C] text-[10px] font-mono-editorial font-bold uppercase tracking-widest mb-2">
            <Lock className="w-3 h-3" />
            <span>Secured Editorial Dashboard</span>
          </div>

          <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#111110]">
            The Folded Page
          </h1>
          <p className="font-serif-editorial italic text-xs sm:text-sm text-[#6E6A62] mt-1">
            "Editorial CMS, Publication Dispatches & Archival Control"
          </p>

          <div className="mt-4 p-2.5 bg-[#FAF9F6] border border-[#E8E5DF] rounded-xs text-left text-[11px] font-mono-editorial text-[#55524B]">
            <div className="flex items-center gap-1.5 text-[#111110] font-bold mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Owner Access Protection:</span>
            </div>
            <p className="text-[#6E6A62] text-[10px] leading-relaxed">
              Publication console is restricted. Authenticate with an authorized owner or staff account to access the dashboard.
            </p>
          </div>

          {/* Primary Tabs: Log In vs Sign Up vs Direct Staff */}
          <div className="flex items-center justify-center gap-1 mt-5 p-1 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs max-w-xs mx-auto">
            <button
              type="button"
              id="admin-tab-login"
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all rounded-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#111110] text-white shadow-xs'
                  : 'text-[#55524B] hover:text-[#111110]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              id="admin-tab-signup"
              onClick={() => {
                setActiveTab('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all rounded-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-[#111110] text-white shadow-xs'
                  : 'text-[#55524B] hover:text-[#111110]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>

        {/* CLERK EMBEDDED AUTHENTICATION OR DIRECT FORM */}
        <div className="flex justify-center my-2 min-h-[300px]">
          {activeTab === 'login' ? (
            <div className="w-full">
              <SignIn
                routing="virtual"
                fallbackRedirectUrl={currentRedirect}
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'border-0 shadow-none p-0 w-full',
                    socialButtonsBlockButton:
                      'rounded-xs border border-[#E8E5DF] hover:bg-[#F5F4F0] text-xs transition-colors',
                    formButtonPrimary:
                      'bg-[#111110] hover:bg-[#EA580C] text-xs font-semibold rounded-xs shadow-xs transition-colors',
                    footerActionLink: 'text-[#EA580C] hover:text-[#C2410C]',
                  },
                }}
              />
              <div className="mt-4 pt-3 border-t border-[#E8E5DF] text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('direct')}
                  className="text-[11px] text-[#8E8A81] hover:text-[#EA580C] font-mono-editorial transition-colors underline"
                >
                  Direct Staff / Owner Email Sign In →
                </button>
              </div>
            </div>
          ) : activeTab === 'signup' ? (
            <div className="w-full">
              <SignUp
                routing="virtual"
                fallbackRedirectUrl={currentRedirect}
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'border-0 shadow-none p-0 w-full',
                    socialButtonsBlockButton:
                      'rounded-xs border border-[#E8E5DF] hover:bg-[#F5F4F0] text-xs transition-colors',
                    formButtonPrimary:
                      'bg-[#111110] hover:bg-[#EA580C] text-xs font-semibold rounded-xs shadow-xs transition-colors',
                    footerActionLink: 'text-[#EA580C] hover:text-[#C2410C]',
                  },
                }}
              />
              <div className="mt-4 pt-3 border-t border-[#E8E5DF] text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('direct')}
                  className="text-[11px] text-[#8E8A81] hover:text-[#EA580C] font-mono-editorial transition-colors underline"
                >
                  Direct Staff / Owner Email Sign In →
                </button>
              </div>
            </div>
          ) : (
            /* Direct Email Fallback */
            <form onSubmit={handleDirectLogin} className="w-full space-y-4 pt-2">
              <div className="text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111110] mb-1 font-mono-editorial">
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8E8A81] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="arjunjareda1355@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E8E5DF] rounded-xs bg-[#FFFFFF] focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111110] mb-1 font-mono-editorial">
                  Passcode (Optional)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#8E8A81] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter owner passcode if set"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E8E5DF] rounded-xs bg-[#FFFFFF] focus:outline-none focus:border-[#EA580C]"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 p-2 bg-[#FEF2F2] border border-[#FECACA] rounded-xs text-[#DC2626] text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#111110] hover:bg-[#EA580C] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>{loading ? 'Authenticating...' : 'Enter Admin Dashboard'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-[11px] text-[#6E6A62] hover:text-[#111110] font-mono-editorial underline"
                >
                  ← Back to Clerk Sign In / Sign Up
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Navigation Return */}
        <div className="mt-8 pt-4 border-t border-[#E8E5DF] text-center">
          <button
            type="button"
            onClick={handleExit}
            className="text-xs text-[#6E6A62] hover:text-[#111110] font-mono-editorial inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Live Magazine</span>
          </button>
        </div>
      </div>
    </div>
  );
};

