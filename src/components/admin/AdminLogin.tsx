import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, KeyRound, UserCheck, UserPlus } from 'lucide-react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { useMagazine } from '../../context/MagazineContext';
import { BrandLogo } from '../BrandLogo';

interface AdminLoginProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onBackToSite?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel, onBackToSite }) => {
  const { loginAsAdmin, registerUser, isOwner } = useMagazine();
  const { isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [authProvider, setAuthProvider] = useState<'direct' | 'clerk'>('direct');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleExit = onBackToSite || onCancel || (() => (window.location.hash = ''));

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await loginAsAdmin(email.trim(), password);
      setSuccessMessage('Authenticated successfully. Redirecting to publisher console...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else window.location.hash = '/admin';
      }, 600);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await registerUser({
        email: email.trim(),
        name: name.trim() || undefined,
        password,
      });
      setSuccessMessage('Account created successfully. Accessing publisher console...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else window.location.hash = '/admin';
      }, 600);
    } catch (err: any) {
      console.error('Sign up error:', err);
      setErrorMessage(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
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
            <span>Owner & Editorial Authentication</span>
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
              Publication console is restricted. Authenticate with an authorized owner or staff account to manage articles and system settings.
            </p>
          </div>

          {/* Primary Tabs: Log In vs Sign Up */}
          <div className="flex items-center justify-center gap-1 mt-5 p-1 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs max-w-xs mx-auto">
            <button
              type="button"
              id="admin-tab-login"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
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
                setErrorMessage(null);
                setSuccessMessage(null);
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

        {/* Status Banners */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xs text-xs text-[#DC2626] font-mono-editorial flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xs text-xs text-[#16A34A] font-mono-editorial flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Method Switcher: Direct Form vs Clerk */}
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => setAuthProvider(authProvider === 'direct' ? 'clerk' : 'direct')}
            className="text-[10px] font-mono-editorial text-[#8E8A81] hover:text-[#EA580C] transition-colors underline underline-offset-2 cursor-pointer"
          >
            {authProvider === 'direct' ? 'Switch to Clerk SSO' : 'Switch to Direct Credentials'}
          </button>
        </div>

        {/* DIRECT FORM: LOG IN */}
        {authProvider === 'direct' && activeTab === 'login' && (
          <form onSubmit={handleDirectLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-editorial uppercase font-bold text-[#111110] mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="owner-login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="publisher@thefoldedpage.com"
                required
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#EA580C] focus:bg-[#FFFFFF] rounded-xs outline-none font-sans-editorial transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono-editorial uppercase font-bold text-[#111110]">
                  Password / Passcode
                </label>
              </div>
              <input
                type="password"
                id="owner-login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#EA580C] focus:bg-[#FFFFFF] rounded-xs outline-none font-sans-editorial transition-colors"
              />
            </div>

            <button
              type="submit"
              id="owner-login-submit-button"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-mono-editorial font-bold text-xs uppercase tracking-wider rounded-xs shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmitting ? 'Authenticating...' : 'Log In to Owner Console'}</span>
            </button>
          </form>
        )}

        {/* DIRECT FORM: SIGN UP */}
        {authProvider === 'direct' && activeTab === 'signup' && (
          <form onSubmit={handleDirectSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-editorial uppercase font-bold text-[#111110] mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="owner-signup-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Editorial Contributor"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#EA580C] focus:bg-[#FFFFFF] rounded-xs outline-none font-sans-editorial transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-editorial uppercase font-bold text-[#111110] mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="owner-signup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@thefoldedpage.com"
                required
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#EA580C] focus:bg-[#FFFFFF] rounded-xs outline-none font-sans-editorial transition-colors"
              />
              <span className="block text-[10px] text-[#8E8A81] font-mono-editorial mt-1">
                Authorized staff and editorial team registration.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono-editorial uppercase font-bold text-[#111110] mb-1">
                Create Password
              </label>
              <input
                type="password"
                id="owner-signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#EA580C] focus:bg-[#FFFFFF] rounded-xs outline-none font-sans-editorial transition-colors"
              />
            </div>

            <button
              type="submit"
              id="owner-signup-submit-button"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#111110] hover:bg-[#333330] text-white font-mono-editorial font-bold text-xs uppercase tracking-wider rounded-xs shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Account...' : 'Sign Up & Request Owner Access'}</span>
            </button>
          </form>
        )}

        {/* CLERK EMBEDDED AUTH */}
        {authProvider === 'clerk' && (
          <div className="flex flex-col items-center my-2 w-full">
            {activeTab === 'login' ? (
              <SignIn
                routing="hash"
                fallbackRedirectUrl="/#admin"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'border-0 shadow-none p-0 w-full',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                  },
                }}
              />
            ) : (
              <SignUp
                routing="hash"
                fallbackRedirectUrl="/#admin"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'border-0 shadow-none p-0 w-full',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                  },
                }}
              />
            )}
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setAuthProvider('direct')}
                className="text-[11px] font-mono-editorial text-[#6E6A62] hover:text-[#EA580C] underline transition-colors cursor-pointer"
              >
                Having trouble with Clerk? Click here for Direct Password Login &rarr;
              </button>
            </div>
          </div>
        )}

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
