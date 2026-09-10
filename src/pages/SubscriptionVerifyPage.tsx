import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface SubscriptionVerifyPageProps {
  onHome: () => void;
  onExplore: () => void;
}

export const SubscriptionVerifyPage: React.FC<SubscriptionVerifyPageProps> = ({
  onHome,
  onExplore,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'error' | 'already'>('success');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resubscribeEmail, setResubscribeEmail] = useState('');
  const [resubscribeLoading, setResubscribeLoading] = useState(false);
  const [resubscribeSuccess, setResubscribeSuccess] = useState(false);

  useEffect(() => {
    // Parse URL params from hash or query string
    const fullSearch = window.location.hash.includes('?')
      ? window.location.hash.split('?')[1]
      : window.location.search.replace(/^\?/, '');
    const params = new URLSearchParams(fullSearch);
    const token = params.get('token');
    const paramStatus = params.get('status');
    const paramEmail = params.get('email');
    const paramMessage = params.get('message');

    if (paramEmail) setEmail(paramEmail);

    if (paramStatus === 'success') {
      setLoading(false);
      setStatus('success');
      setMessage(paramMessage || 'Your email address has been verified.');
      showToast('Subscription activated successfully', 'success');
      return;
    }

    if (paramStatus === 'error') {
      setLoading(false);
      setStatus('error');
      setMessage(paramMessage || 'This verification link is invalid or has expired.');
      return;
    }

    if (token) {
      // Call verify API
      api
        .verifyNewsletter(token)
        .then((res) => {
          setLoading(false);
          setStatus('success');
          setMessage(res.message || 'Your email address has been successfully verified.');
          if (res.subscriber?.email) setEmail(res.subscriber.email);
          showToast('Welcome to The Folded Letter ledger', 'success');
        })
        .catch((err) => {
          setLoading(false);
          setStatus('error');
          setMessage(err.message || 'Invalid or expired verification link.');
        });
    } else {
      setLoading(false);
      setStatus('error');
      setMessage('No verification token was found in the link.');
    }
  }, []);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubscribeEmail || !resubscribeEmail.includes('@')) return;
    setResubscribeLoading(true);
    try {
      const res = await api.subscribeNewsletter(resubscribeEmail);
      setResubscribeSuccess(true);
      showToast(res.message, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to resend confirmation.', 'error');
    } finally {
      setResubscribeLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E8E5DF] flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-xl w-full bg-[#FFFFFF] border border-[#E8E5DF] shadow-md p-8 sm:p-12 rounded-xs text-center">
        {loading ? (
          <div className="py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-[#EA580C] animate-spin mx-auto" />
            <p className="text-xs font-mono-editorial text-[#6E6A62] uppercase tracking-wider">
              Verifying your readership credentials...
            </p>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-6">
            <div className="w-12 h-12 bg-[#F0FDF4] border border-[#86EFAC] rounded-full flex items-center justify-center mx-auto text-[#16A34A]">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono-editorial uppercase font-bold tracking-widest text-[#EA580C]">
                LEDGER CONFIRMED
              </span>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl font-medium text-[#111110]">
                Welcome to The Folded Letter
              </h1>
              <p className="text-xs sm:text-sm text-[#55524B] max-w-md mx-auto leading-relaxed">
                {email ? (
                  <>
                    <strong className="text-[#111110]">{email}</strong> has been activated on our weekly subscriber ledger.
                  </>
                ) : (
                  message
                )}
              </p>
            </div>

            <div className="bg-[#FAF9F6] border border-[#E8E5DF] p-4 text-xs text-[#6E6A62] font-mono-editorial rounded-xs text-left space-y-1">
              <div className="text-[#111110] font-bold uppercase tracking-wider mb-1">
                DISPATCH SCHEDULE
              </div>
              <div>Frequency: Every Wednesday morning at dawn</div>
              <div>Contents: 3 Cultural Inquiries • 1 Archive Artifact • 2 Readings</div>
              <div>Delivery: Sent directly from our global editorial desk</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onExplore}
                className="flex-1 bg-[#EA580C] hover:bg-[#C2410C] text-white py-3 px-6 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded-xs shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explore The Archive</span>
              </button>
              <button
                onClick={onHome}
                className="flex-1 bg-[#F5F4F0] hover:bg-[#E8E5DF] text-[#111110] py-3 px-6 text-xs font-semibold uppercase tracking-widest transition-colors rounded-xs border border-[#E8E5DF]"
              >
                Return to Frontpage
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-12 h-12 bg-[#FEF2F2] border border-[#FCA5A5] rounded-full flex items-center justify-center mx-auto text-[#DC2626]">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono-editorial uppercase font-bold tracking-widest text-[#DC2626]">
                VERIFICATION FAILED
              </span>
              <h1 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#111110]">
                Link Expired or Invalid
              </h1>
              <p className="text-xs sm:text-sm text-[#55524B] leading-relaxed">
                {message || 'This confirmation link has already been used or has expired (links expire after 48 hours).'}
              </p>
            </div>

            {/* Request a new link */}
            <div className="bg-[#FAF9F6] border border-[#E8E5DF] p-5 rounded-xs text-left space-y-3">
              <span className="text-xs font-mono-editorial uppercase font-bold text-[#111110] block">
                Request a Fresh Verification Link
              </span>
              {resubscribeSuccess ? (
                <div className="text-xs text-[#16A34A] flex items-center gap-2 bg-[#F0FDF4] p-3 border border-[#86EFAC] rounded-xs font-mono-editorial">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>A new confirmation dispatch has been sent. Check your inbox.</span>
                </div>
              ) : (
                <form onSubmit={handleResend} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={resubscribeEmail}
                    onChange={(e) => setResubscribeEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 bg-[#FFFFFF] border border-[#E8E5DF] text-xs px-3 py-2 text-[#111110] rounded-xs focus:outline-none focus:border-[#EA580C]"
                  />
                  <button
                    type="submit"
                    disabled={resubscribeLoading}
                    className="bg-[#111110] hover:bg-[#EA580C] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 transition-colors rounded-xs disabled:opacity-50 shrink-0"
                  >
                    {resubscribeLoading ? 'Sending...' : 'Resend'}
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={onHome}
              className="text-xs font-mono-editorial text-[#6E6A62] hover:text-[#111110] uppercase tracking-wider"
            >
              &larr; Return to The Folded Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
