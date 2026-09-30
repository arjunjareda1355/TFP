import React, { useState } from 'react';
import { ArrowLeft, UserCheck, UserPlus } from 'lucide-react';
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
      {/* Container with clean editorial aesthetic */}
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-md p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6 pb-5 border-b border-[#E8E5DF]">
          <div className="flex justify-center mb-4">
            <BrandLogo variant="emblem" size={44} theme="light" />
          </div>

          <h1 className="font-serif-editorial text-2xl font-bold tracking-tight text-[#111110]">
            The Folded Page
          </h1>

          {/* Primary Tabs: Log In vs Sign Up */}
          <div className="flex items-center justify-center gap-1 mt-4 p-1 bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs max-w-xs mx-auto">
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
            <div className="w-full">
              <SignIn
                routing="virtual"
                fallbackRedirectUrl="/admin"
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
            </div>
          ) : (
            <div className="w-full">
              <SignUp
                routing="virtual"
                fallbackRedirectUrl="/admin"
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
            </div>
          )}
        </div>

        {/* Navigation Return */}
        <div className="mt-6 pt-4 border-t border-[#E8E5DF] text-center">
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
