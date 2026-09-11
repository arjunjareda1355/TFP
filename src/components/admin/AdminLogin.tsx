import React, { useState } from 'react';
import { Lock, ArrowLeft, UserCheck, UserPlus, ShieldCheck } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { BrandLogo } from '../BrandLogo';

interface AdminLoginProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onBackToSite?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel, onBackToSite }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const handleExit = onBackToSite || onCancel || (() => (window.location.hash = ''));

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
              onClick={() => setActiveTab('login')}
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
              onClick={() => setActiveTab('signup')}
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

        {/* CLERK EMBEDDED AUTHENTICATION */}
        <div className="flex justify-center my-2 min-h-[300px]">
          {activeTab === 'login' ? (
            <SignIn
              routing="virtual"
              fallbackRedirectUrl="/#admin"
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
          ) : (
            <SignUp
              routing="virtual"
              fallbackRedirectUrl="/#admin"
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
