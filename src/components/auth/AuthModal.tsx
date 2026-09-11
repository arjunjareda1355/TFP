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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111110]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        className="relative w-full max-w-md bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
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
        <div className="pt-7 pb-4 px-6 sm:px-8 text-center bg-[#FAF9F6] border-b border-[#E8E5DF]">
          <div className="flex justify-center mb-4">
            <BrandLogo />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#EFECE6] p-0.5 rounded-xs max-w-xs mx-auto">
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
        <div className="p-6 sm:p-8 flex justify-center items-center min-h-[320px]">
          <ClerkModalErrorBoundary>
            {authModalMode === 'login' ? (
              <SignIn
                routing="virtual"
                fallbackRedirectUrl="/#home"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'border-0 shadow-none p-0 w-full bg-transparent',
                    socialButtonsBlockButton:
                      'rounded-xs border border-[#E8E5DF] hover:bg-[#F5F4F0] text-xs transition-colors',
                    formButtonPrimary:
                      'bg-[#111110] hover:bg-[#EA580C] text-xs font-semibold rounded-xs shadow-xs transition-colors',
                    footerActionLink: 'text-[#EA580C] hover:text-[#C2410C]',
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
                    socialButtonsBlockButton:
                      'rounded-xs border border-[#E8E5DF] hover:bg-[#F5F4F0] text-xs transition-colors',
                    formButtonPrimary:
                      'bg-[#111110] hover:bg-[#EA580C] text-xs font-semibold rounded-xs shadow-xs transition-colors',
                    footerActionLink: 'text-[#EA580C] hover:text-[#C2410C]',
                  },
                }}
              />
            )}
          </ClerkModalErrorBoundary>
        </div>
      </div>
    </div>
  );
};
