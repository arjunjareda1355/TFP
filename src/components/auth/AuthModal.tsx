import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User as UserIcon, ArrowRight, Loader2, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { SignIn, SignUp, useClerk } from '@clerk/clerk-react';
import { useMagazine } from '../../context/MagazineContext';
import { useToast } from '../../context/ToastContext';
import { BrandLogo } from '../BrandLogo';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, loginAsAdmin, registerUser, currentUser } = useMagazine();
  const { showToast } = useToast();
  const clerk = useClerk();

  const [authMethod, setAuthMethod] = useState<'clerk' | 'direct'>('direct');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Close modal if already authenticated
  useEffect(() => {
    if (currentUser && isAuthModalOpen) {
      const timer = setTimeout(() => {
        closeAuthModal();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentUser, isAuthModalOpen, closeAuthModal]);

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter an email address.');
      return;
    }

    setLoading(true);
    try {
      if (authModalMode === 'login') {
        const user = await loginAsAdmin(cleanEmail, password);
        setSuccessMessage(`Welcome back, ${user.name || user.email}!`);
        showToast(`Signed in successfully as ${user.name || user.email}`, 'success');
        setTimeout(() => {
          closeAuthModal();
          if (user.isPermanentOwner || user.role.includes('OWNER') || user.role.includes('ADMIN')) {
            window.location.hash = '/admin';
          }
        }, 800);
      } else {
        const user = await registerUser({ email: cleanEmail, name: name.trim() || undefined, password });
        setSuccessMessage(`Account created! Welcome, ${user.name || user.email}.`);
        showToast(`Account created successfully!`, 'success');
        setTimeout(() => {
          closeAuthModal();
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111110]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        className="relative w-full max-w-md bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 text-[#8E8A81] hover:text-[#111110] hover:bg-[#F5F4F0] rounded-xs transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pt-8 pb-6 px-6 sm:px-8 text-center bg-[#FAF9F6] border-b border-[#E8E5DF]">
          <div className="flex justify-center mb-3">
            <BrandLogo />
          </div>
          <div className="text-[10px] font-mono-editorial uppercase text-[#EA580C] tracking-widest font-semibold mb-1">
            The Folded Page Access
          </div>
          <h2 className="font-serif-editorial text-2xl font-bold text-[#111110]">
            {authModalMode === 'login' ? 'Sign In to Your Account' : 'Create Your Reader Account'}
          </h2>
          <p className="font-serif-editorial italic text-xs text-[#6E6A62] mt-1 max-w-xs mx-auto">
            {authModalMode === 'login'
              ? 'Access saved reading lists, personalized edition preferences, and editorial management.'
              : 'Join The Folded Page for ad-free reading, bookmarks, and exclusive print dispatches.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex mt-5 bg-[#EFECE6] p-0.5 rounded-xs">
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-mono-editorial uppercase tracking-wider font-semibold transition-all rounded-xs cursor-pointer ${
                authModalMode === 'login'
                  ? 'bg-white text-[#111110] shadow-xs'
                  : 'text-[#6E6A62] hover:text-[#111110]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('signup');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-mono-editorial uppercase tracking-wider font-semibold transition-all rounded-xs cursor-pointer ${
                authModalMode === 'signup'
                  ? 'bg-white text-[#111110] shadow-xs'
                  : 'text-[#6E6A62] hover:text-[#111110]'
              }`}
            >
              Join Free
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Method Switcher: Clerk SSO vs Direct Credentials */}
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#F0EFEB]">
            <span className="font-mono-editorial text-[11px] text-[#8E8A81] uppercase tracking-wider">
              Authentication Method
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAuthMethod('direct')}
                className={`px-2 py-1 text-[10px] font-mono-editorial uppercase tracking-wider rounded-xs cursor-pointer transition-colors ${
                  authMethod === 'direct'
                    ? 'bg-[#111110] text-white font-semibold'
                    : 'text-[#6E6A62] hover:bg-[#F5F4F0]'
                }`}
              >
                Email / Password
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('clerk')}
                className={`px-2 py-1 text-[10px] font-mono-editorial uppercase tracking-wider rounded-xs cursor-pointer transition-colors flex items-center gap-1 ${
                  authMethod === 'clerk'
                    ? 'bg-[#EA580C] text-white font-semibold'
                    : 'text-[#6E6A62] hover:bg-[#F5F4F0]'
                }`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>Clerk SSO</span>
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xs text-[#B91C1C] text-xs leading-relaxed font-sans animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#ECFDF5] border border-[#6EE7B7] rounded-xs text-[#047857] text-xs leading-relaxed font-sans flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-[#059669]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* CLERK EMBEDDED AUTH */}
          {authMethod === 'clerk' ? (
            <div className="space-y-4">
              <div className="flex justify-center min-h-[220px]">
                {authModalMode === 'login' ? (
                  <SignIn
                    routing="virtual"
                    fallbackRedirectUrl="/#home"
                    appearance={{
                      elements: {
                        rootBox: 'w-full',
                        card: 'border-0 shadow-none p-0 w-full bg-transparent',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                        socialButtonsBlockButton: 'rounded-xs border border-[#E8E5DF] hover:bg-[#F5F4F0] text-xs',
                        formButtonPrimary: 'bg-[#111110] hover:bg-[#EA580C] text-xs font-semibold rounded-xs shadow-xs',
                      },
                    }}
                  />
                ) : (
                  <SignUp
                    routing="virtual"
                    fallbackRedirectUrl="/#home"
                    appearance={{
                      elements: {
                        rootBox: 'w-full',
                        card: 'border-0 shadow-none p-0 w-full bg-transparent',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                        socialButtonsBlockButton: 'rounded-xs border border-[#E8E5DF] hover:bg-[#F5F4F0] text-xs',
                        formButtonPrimary: 'bg-[#111110] hover:bg-[#EA580C] text-xs font-semibold rounded-xs shadow-xs',
                      },
                    }}
                  />
                )}
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod('direct')}
                  className="text-xs text-[#6E6A62] hover:text-[#111110] hover:underline font-mono-editorial inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Or use Email & Password directly</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            /* DIRECT EMAIL / PASSWORD AUTH */
            <form onSubmit={handleDirectSubmit} className="space-y-3.5">
              {authModalMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-mono-editorial uppercase text-[#55524B] mb-1 font-semibold">
                    Your Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-[#8E8A81]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#EA580C] rounded-xs outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono-editorial uppercase text-[#55524B] mb-1 font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#8E8A81]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reader@foldedpage.in"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#EA580C] rounded-xs outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono-editorial uppercase text-[#55524B] font-semibold">
                    {authModalMode === 'login' ? 'Password or Passcode' : 'Create Password'}
                  </label>
                  {authModalMode === 'login' && (
                    <span className="text-[10px] text-[#8E8A81] font-mono-editorial">
                      Publisher default: editorial2026
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#8E8A81]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DF] focus:border-[#EA580C] rounded-xs outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#111110] hover:bg-[#EA580C] disabled:bg-[#8E8A81] text-white text-xs font-mono-editorial uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>{authModalMode === 'login' ? 'Sign In to Magazine' : 'Complete Registration'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Publisher quick hint */}
              <div className="pt-2 text-center border-t border-[#F0EFEB] flex items-center justify-center gap-1.5 text-[11px] text-[#6E6A62]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>
                  Staff or Publisher? Use your official email (e.g. arjunjareda1355@gmail.com)
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
