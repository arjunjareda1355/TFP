import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface SubscriptionUnsubscribePageProps {
  onHome: () => void;
}

export const SubscriptionUnsubscribePage: React.FC<SubscriptionUnsubscribePageProps> = ({
  onHome,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [manualEmail, setManualEmail] = useState('');

  useEffect(() => {
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
      setStatus('success');
      setMessage(paramMessage || 'You have been unsubscribed from The Folded Letter.');
      showToast('Unsubscribed successfully', 'info');
      return;
    }

    if (paramStatus === 'error') {
      setStatus('error');
      setMessage(paramMessage || 'Failed to process unsubscribe request.');
      return;
    }

    if (token) {
      setLoading(true);
      api
        .unsubscribeNewsletter({ token })
        .then((res) => {
          setLoading(false);
          setStatus('success');
          setMessage(res.message);
          showToast('You have been unsubscribed', 'info');
        })
        .catch((err) => {
          setLoading(false);
          setStatus('error');
          setMessage(err.message || 'Could not verify unsubscribe token.');
        });
    }
  }, []);

  const handleManualUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail || !manualEmail.includes('@')) return;
    setLoading(true);
    try {
      const res = await api.unsubscribeNewsletter({ email: manualEmail });
      setStatus('success');
      setEmail(manualEmail);
      setMessage(res.message);
      showToast('Unsubscribed successfully', 'info');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Could not find subscriber with this email address.');
      showToast(err.message || 'Failed to unsubscribe', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = async () => {
    const targetEmail = email || manualEmail;
    if (!targetEmail) return;
    setLoading(true);
    try {
      const res = await api.subscribeNewsletter(targetEmail);
      showToast(res.message, 'success');
      setStatus('idle');
      setMessage('');
    } catch (err: any) {
      showToast(err.message || 'Failed to resubscribe', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E8E5DF] flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-xl w-full bg-[#FFFFFF] border border-[#E8E5DF] shadow-md p-8 sm:p-12 rounded-xs text-center">
        {loading ? (
          <div className="py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-[#EA580C] animate-spin mx-auto" />
            <p className="text-xs font-mono-editorial text-[#6E6A62] uppercase tracking-wider">
              Updating subscriber preferences...
            </p>
          </div>
        ) : status === 'success' ? (
          <div className="space-y-6">
            <div className="w-12 h-12 bg-[#FAF9F6] border border-[#E8E5DF] rounded-full flex items-center justify-center mx-auto text-[#6E6A62]">
              <CheckCircle2 className="w-6 h-6 text-[#16A34A]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono-editorial uppercase font-bold tracking-widest text-[#6E6A62]">
                SUBSCRIPTION CANCELLED
              </span>
              <h1 className="font-serif-editorial text-3xl sm:text-4xl font-medium text-[#111110]">
                You have been unsubscribed
              </h1>
              <p className="text-xs sm:text-sm text-[#55524B] max-w-md mx-auto leading-relaxed">
                {email ? (
                  <>
                    <strong className="text-[#111110]">{email}</strong> has been removed from our dispatch mailing list. We respect your quiet inbox.
                  </>
                ) : (
                  message || 'You will no longer receive weekly dispatches from The Folded Page.'
                )}
              </p>
            </div>

            <p className="text-xs text-[#8E8A81] font-mono-editorial">
              No further emails will be sent. If this was an accident, you can rejoin at any time.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E8E5DF]">
              <button
                onClick={handleResubscribe}
                className="flex-1 bg-[#111110] hover:bg-[#EA580C] text-white py-3 px-6 text-xs font-semibold uppercase tracking-widest transition-colors rounded-xs"
              >
                Resubscribe Now
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
            <div className="space-y-2">
              <span className="text-[10px] font-mono-editorial uppercase font-bold tracking-widest text-[#EA580C]">
                PREFERENCES
              </span>
              <h1 className="font-serif-editorial text-3xl font-medium text-[#111110]">
                Unsubscribe from The Folded Letter
              </h1>
              <p className="text-xs sm:text-sm text-[#55524B] leading-relaxed">
                Enter your email address below to immediately opt-out from future weekly dispatches.
              </p>
            </div>

            {status === 'error' && (
              <div className="text-xs text-[#DC2626] bg-[#FEF2F2] p-3 border border-[#FCA5A5] rounded-xs font-mono-editorial flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleManualUnsubscribe} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono-editorial uppercase font-bold text-[#6E6A62] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="reader@domain.com"
                  className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E8E5DF] text-xs text-[#111110] placeholder:text-[#8E8A81] focus:outline-none focus:border-[#EA580C] rounded-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111110] hover:bg-[#DC2626] text-white py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors rounded-xs disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Unsubscribe'}
              </button>
            </form>

            <button
              onClick={onHome}
              className="text-xs font-mono-editorial text-[#6E6A62] hover:text-[#111110] uppercase tracking-wider block mx-auto"
            >
              &larr; Return to The Folded Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
