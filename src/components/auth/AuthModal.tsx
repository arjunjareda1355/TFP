import React, { useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { X, AlertCircle, RefreshCw } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useMagazine } from '../../context/MagazineContext';
import { BrandLogo } from '../BrandLogo';

interface ClerkModalErrorBoundaryProps {
  children: ReactNode;
}

interface ClerkModalErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ClerkModalErrorBoundary extends Component<ClerkModalErrorBoundaryProps, ClerkModalErrorBoundaryState> {
  public override state: ClerkModalErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): ClerkModalErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unable to load Clerk authentication.',
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[AuthModal] Clerk component notice:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-[#FAF9F6] border border-[#E8E5DF] rounded-xs text-center space-y-3 my-4">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FFF7ED] text-[#EA580C] mb-1">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-serif-editorial font-bold text-[#111110]">
            Authentication Notice
          </h3>
          <p className="text-xs font-serif-editorial text-[#55524B] leading-relaxed max-w-xs mx-auto">
            {this.state.errorMessage}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            className="px-4 py-2 bg-[#111110] hover:bg-[#EA580C] text-white text-xs font-mono-editorial uppercase tracking-wider font-semibold rounded-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, currentUser } = useMagazine();

  // Close modal if already authenticated
  useEffect(() => {
    if (currentUser && isAuthModalOpen) {
      const timer = setTimeout(() => {
        closeAuthModal();
      }, 700);
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#111110]/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        className="relative w-full max-w-[420px] my-auto max-h-[calc(100dvh-2rem)] flex flex-col bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-3.5 right-3.5 p-1.5 text-[#8E8A81] hover:text-[#111110] hover:bg-[#F5F4F0] rounded-xs transition-colors cursor-pointer z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="shrink-0 pt-6 pb-3.5 px-6 text-center bg-[#FAF9F6] border-b border-[#E8E5DF]">
          <div className="flex justify-center mb-3">
            <BrandLogo />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#EFECE6] p-0.5 rounded-xs max-w-[240px] mx-auto">
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => setAuthModalMode('login')}
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
              id="auth-tab-signup"
              onClick={() => setAuthModalMode('signup')}
              className={`flex-1 py-1.5 text-xs font-mono-editorial uppercase tracking-wider font-semibold transition-all rounded-xs cursor-pointer ${
                authModalMode === 'signup'
                  ? 'bg-white text-[#111110] shadow-xs'
                  : 'text-[#6E6A62] hover:text-[#111110]'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body - Pure Clerk Authentication */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 flex flex-col justify-start items-center">
          <div className="w-full max-w-full flex justify-center">
            <ClerkModalErrorBoundary>
              {authModalMode === 'login' ? (
                <SignIn
                  routing="virtual"
                  fallbackRedirectUrl="/"
                  appearance={{
                    elements: {
                      rootBox: 'w-full max-w-full flex justify-center mx-auto',
                      cardBox: 'w-full max-w-full shadow-none flex justify-center mx-auto',
                      card: 'border-0 shadow-none p-0 w-full max-w-full bg-transparent mx-auto',
                      header: 'hidden',
                      socialButtonsBlockButton:
                        'w-full rounded-xs border border-[#E8E5DF] hover:bg-[#F5F4F0] text-xs transition-colors',
                      formButtonPrimary:
                        'w-full bg-[#111110] hover:bg-[#EA580C] text-xs font-semibold rounded-xs shadow-xs transition-colors py-2.5',
                      footerActionLink: 'text-[#EA580C] hover:text-[#C2410C]',
                    },
                  }}
                />
              ) : (
                <SignUp
                  routing="virtual"
                  fallbackRedirectUrl="/"
                  appearance={{
                    elements: {
                      rootBox: 'w-full max-w-full flex justify-center mx-auto',
                      cardBox: 'w-full max-w-full shadow-none flex justify-center mx-auto',
                      card: 'border-0 shadow-none p-0 w-full max-w-full bg-transparent mx-auto',
                      header: 'hidden',
                      socialButtonsBlockButton:
                        'w-full rounded-xs border border-[#E8E5DF] hover:bg-[#F5F4F0] text-xs transition-colors',
                      formButtonPrimary:
                        'w-full bg-[#111110] hover:bg-[#EA580C] text-xs font-semibold rounded-xs shadow-xs transition-colors py-2.5',
                      footerActionLink: 'text-[#EA580C] hover:text-[#C2410C]',
                    },
                  }}
                />
              )}
            </ClerkModalErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};
