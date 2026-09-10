import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Mail, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const NewsletterBox: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<'weekly' | 'all'>('weekly');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.subscribeNewsletter(cleanEmail, tier);
      setIsSuccess(true);
      setSuccessMessage(res.message || 'Please check your inbox to confirm your subscription.');
      if (res.verifyUrl) {
        setVerifyUrl(res.verifyUrl);
      }
      showToast(res.message || 'Subscription request received.', 'success');
    } catch (err: any) {
      const msg = err.message || 'Failed to submit subscription request.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-14 sm:py-20 border-b border-[#E8E5DF] bg-[#FFFFFF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFFFF] border border-[#E8E5DF] p-8 sm:p-12 shadow-sm rounded-xs relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-3 font-mono-editorial">
              <Mail className="w-3.5 h-3.5" />
              <span>THE FOLDED LETTER</span>
            </div>

            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-medium text-[#111110] tracking-tight mb-3">
              Interesting things, beautifully delivered.
            </h2>

            <p className="text-sm sm:text-base text-[#55524B] font-normal leading-relaxed mb-8">
              A curated selection of the stories, ideas, and discoveries worth knowing. Every Wednesday morning, straight from our editorial desk.
            </p>

            {isSuccess ? (
              <div className="bg-[#F0FDF4] border border-[#86EFAC] p-6 text-center rounded-xs">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
                <h4 className="font-serif-editorial text-xl font-medium text-[#111110] mb-1">
                  You are officially on the ledger.
                </h4>
                <p className="text-xs sm:text-sm text-[#55524B] max-w-md mx-auto">
                  {successMessage}
                </p>
                {verifyUrl && (
                  <div className="pt-3">
                    <a
                      href={verifyUrl}
                      className="inline-flex items-center gap-1 text-xs font-mono-editorial font-bold text-[#EA580C] underline hover:text-[#C2410C]"
                    >
                      <span>Instant Confirmation Link &rarr;</span>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      disabled={loading}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 bg-[#FFFFFF] border border-[#E8E5DF] text-sm text-[#111110] placeholder:text-[#8E8A81] focus:outline-none focus:border-[#EA580C] rounded-xs disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#EA580C] hover:bg-[#C2410C] text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shrink-0 rounded-xs shadow-xs disabled:opacity-50"
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
                  </div>
                  {error && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-[#DC2626] mt-2 font-mono-editorial">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-6 pt-2 text-xs text-[#6E6A62]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      checked={tier === 'weekly'}
                      onChange={() => setTier('weekly')}
                      className="accent-[#EA580C]"
                    />
                    <span>Weekly Digest (Wednesdays)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      checked={tier === 'all'}
                      onChange={() => setTier('all')}
                      className="accent-[#EA580C]"
                    />
                    <span>All Breaking Editions</span>
                  </label>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
