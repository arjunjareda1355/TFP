import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, LogOut } from 'lucide-react';
import { UserButton, useClerk } from '@clerk/clerk-react';
import { useMagazine } from '../../context/MagazineContext';
import { BrandLogo } from '../BrandLogo';

interface AdminAccessDeniedProps {
  onBackToSite: () => void;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({ onBackToSite }) => {
  const { currentUser } = useMagazine();
  const { signOut } = useClerk();

  const handleSignOutAndExit = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    onBackToSite();
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col justify-center items-center px-4 py-12 select-none">
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E8E5DF] rounded-xs shadow-md p-8 sm:p-10 text-center">
        {/* Brand Masthead */}
        <div className="flex justify-center mb-6">
          <BrandLogo variant="emblem" size={48} theme="light" />
        </div>

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="text-[11px] font-mono-editorial uppercase text-[#DC2626] font-bold tracking-widest mb-1">
          Owner Authorization Required
        </div>

        <h1 className="font-serif-editorial text-2xl sm:text-3xl font-medium tracking-tight text-[#111110] mb-3">
          Restricted Publication Desk
        </h1>

        <p className="text-xs text-[#55524B] font-sans-editorial leading-relaxed mb-6">
          Access to The Folded Page CMS, editorial dashboard, and publishing controls is restricted exclusively to authorized publication owners and editorial staff.
        </p>

        {/* Current Identity Details */}
        <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-xs p-4 text-left mb-6 font-mono-editorial text-xs space-y-2">
          <div className="flex items-center justify-between text-[#8E8A81]">
            <span>Current Session</span>
            <span className="text-[#DC2626] font-semibold">Access Denied</span>
          </div>
          <div className="pt-2 border-t border-[#E8E5DF] flex items-center justify-between">
            <span className="text-[#6E6A62]">Account:</span>
            <span className="text-[#111110] font-bold truncate max-w-[200px]">
              {currentUser?.email || 'Unauthorized Contributor'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#6E6A62]">Role:</span>
            <span className="text-[#8E8A81]">Public Reader / Contributor</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onBackToSite}
            className="w-full py-3 bg-[#111110] hover:bg-[#EA580C] text-white font-semibold text-xs uppercase tracking-wider rounded-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Live Magazine</span>
          </button>

          <button
            onClick={handleSignOutAndExit}
            className="w-full py-2.5 bg-[#FFFFFF] border border-[#E8E5DF] hover:bg-[#F5F4F0] text-[#6E6A62] hover:text-[#111110] font-semibold text-xs uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Account / Sign Out</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-[#E8E5DF] text-[11px] text-[#8E8A81] font-mono-editorial">
          The Folded Page Publishing Security System
        </div>
      </div>
    </div>
  );
};
