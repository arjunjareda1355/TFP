import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useMagazine } from '../context/MagazineContext';

interface NewsletterCTAProps {
  variant?: 'inline' | 'banner' | 'card';
  className?: string;
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NewsletterCTA: React.FC<NewsletterCTAProps> = ({
  variant = 'card',
  className = '',
  onSuccess,
}) => {
  const { showToast } = useToast();
  const { subscriberCount, refreshSubscribers } = useMagazine();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.subscribeNewsletter(cleanEmail, 'weekly');
      setSubscribed(true);
      setSuccessMessage(res.message || 'Please check your inbox to confirm your subscription.');
      await refreshSubscribers();
      showToast(res.message || 'Subscription request received.', 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.message || 'Failed to submit subscription request.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'banner') {
    return (
      <div className={`bg-[#F9F8F6] border-y border-[#E8E5DF] py-10 px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-mono-editorial uppercase text-[#EA580C] font-bold tracking-widest block">
              THE FOLDED LETTER • WEEKLY
            </span>
            <h3 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#111110]">
              What's worth knowing, delivered weekly.
            </h3>
            <p className="text-xs sm:text-sm text-[#55524B]">
              One quiet email every Wednesday morning. Zero spam, zero sponsored noise.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 text-[#16A34A] text-xs font-mono-editorial bg-[#F0FDF4] px-4 py-3 border border-[#86EFAC] rounded-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage || 'You are on the list for next Wednesday.'}</span>
            </div>
          ) : (
            <div className="flex flex-col w-full md:w-auto min-w-[320px]">
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="reader@domain.com"
                  className="px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E8E5DF] text-xs text-[#111110] placeholder:text-[#8E8A81] outline-none focus:border-[#EA580C] rounded-xs flex-1 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 transition-colors rounded-xs shadow-xs shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Join</span>
                  )}
                </button>
              </form>
              {error && (
                <div className="flex items-center gap-1 text-[11px] text-[#DC2626] mt-1.5 font-mono-editorial">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#F9F8F6] border border-[#E8E5DF] p-6 sm:p-8 rounded-xs shadow-xs ${className}`}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-2 font-mono-editorial">
        <Mail className="w-3.5 h-3.5" />
        <span>THE FOLDED LETTER</span>
      </div>
      <h3 className="font-serif-editorial text-xl sm:text-2xl font-medium text-[#111110] mb-2">
        Never miss an inquiry
      </h3>
      <p className="text-xs sm:text-sm text-[#55524B] mb-5 leading-relaxed">
        {subscriberCount > 1 ? (
          <>Join over {subscriberCount.toLocaleString()} readers who receive our curated weekly dispatch on culture, rare crafts, and natural anomalies.</>
        ) : subscriberCount === 1 ? (
          <>Join our reader who receives our curated weekly dispatch on culture, rare crafts, and natural anomalies.</>
        ) : (
          <>Receive our curated weekly dispatch on culture, rare crafts, and natural anomalies.</>
        )}
      </p>

      {subscribed ? (
        <div className="flex items-center gap-2 text-[#16A34A] text-xs font-mono-editorial bg-[#F0FDF4] p-3 border border-[#86EFAC] rounded-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage || 'Subscribed. Check your email for confirmation.'}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="your.email@domain.com"
              className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E8E5DF] text-xs text-[#111110] placeholder:text-[#8E8A81] outline-none focus:border-[#EA580C] rounded-xs disabled:opacity-50"
            />
            {error && (
              <div className="flex items-center gap-1 text-[11px] text-[#DC2626] mt-1.5 font-mono-editorial">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold uppercase tracking-widest py-2.5 transition-colors flex items-center justify-center gap-1.5 rounded-xs shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Subscribing...</span>
              </>
            ) : (
              <>
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
