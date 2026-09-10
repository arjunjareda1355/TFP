import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';
import { BrandLogo } from './BrandLogo';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const NewsletterModal: React.FC = () => {
  const { isNewsletterOpen, setIsNewsletterOpen } = useMagazine();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'all'>('weekly');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state whenever modal is opened
  useEffect(() => {
    if (isNewsletterOpen) {
      setError(null);
      // Keep previous success if user just submitted, but if reopened freshly, allow clean state
    }
  }, [isNewsletterOpen]);

  // Handle ESC key and body scroll lock
  useEffect(() => {
    if (!isNewsletterOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNewsletterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isNewsletterOpen, setIsNewsletterOpen]);

  if (!isNewsletterOpen) return null;

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
      const res = await api.subscribeNewsletter(cleanEmail, frequency);
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

  const handleReset = () => {
    setIsSuccess(false);
    setEmail('');
    setVerifyUrl(null);
    setError(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => {
        setIsNewsletterOpen(false);
      }}
    >
      <div
        className="w-full max-w-lg bg-[#FFFFFF] border border-[#E8E5DF] shadow-2xl p-6 sm:p-8 relative rounded-xs animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            setIsNewsletterOpen(false);
          }}
          className="absolute top-4 right-4 p-2 text-[#6E6A62] hover:text-[#111110] hover:bg-[#F5F4F0] transition-colors rounded-xs cursor-pointer"
          aria-label="Close newsletter modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-md mx-auto">
          <BrandLogo variant="emblem" size={36} theme="light" className="mx-auto mb-3" />

          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-2 font-mono-editorial">
            <Mail className="w-3.5 h-3.5" />
            <span>THE FOLDED LETTER</span>
          </div>

          <h3 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#111110] mb-2">
            Interesting things, beautifully delivered.
          </h3>

          <p className="text-xs sm:text-sm text-[#55524B] font-normal leading-relaxed mb-6">
            Join over 45,000 discerning readers who receive our curated dispatches on culture, craft, technology, and anomalies every Wednesday.
          </p>

          {isSuccess ? (
            <div className="bg-[#F0FDF4] border border-[#86EFAC] p-6 text-center space-y-3 rounded-xs">
              <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
              <h4 className="font-serif-editorial text-xl font-medium text-[#111110]">
                Welcome to The Folded Letter
              </h4>
              <p className="text-xs text-[#55524B]">
                {successMessage || (
                  <>
                    We've sent a dispatch to <strong className="text-[#111110]">{email}</strong>. Look for our first unfolding in your inbox this Wednesday at 7:00 AM.
                  </>
                )}
              </p>
              {verifyUrl && (
                <div className="pt-2">
                  <a
                    href={verifyUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-mono-editorial font-bold text-[#EA580C] underline hover:text-[#C2410C]"
                  >
                    <span>Instant Confirmation Link &rarr;</span>
                  </a>
                </div>
              )}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewsletterOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#111110] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#2A2926] transition-colors cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-mono-editorial text-[#55524B] hover:text-[#EA580C] underline cursor-pointer"
                >
                  Subscribe another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono-editorial uppercase tracking-wider text-[#6E6A62] mb-1.5 font-bold">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="your.name@domain.com"
                  className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E8E5DF] text-sm text-[#111110] placeholder:text-[#8E8A81] focus:outline-none focus:border-[#EA580C] rounded-xs disabled:opacity-50"
                />
                {error && (
                  <div className="flex items-center gap-1.5 text-xs text-[#DC2626] mt-1.5 font-mono-editorial">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono-editorial uppercase tracking-wider text-[#6E6A62] mb-2 font-bold">
                  Delivery Frequency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setFrequency('weekly')}
                    className={`p-3 text-xs border text-left transition-all rounded-xs cursor-pointer ${
                      frequency === 'weekly'
                        ? 'border-[#EA580C] bg-[#FFF7ED] text-[#111110] font-semibold'
                        : 'border-[#E8E5DF] bg-[#F9F8F6] text-[#55524B] hover:text-[#111110]'
                    } disabled:opacity-50`}
                  >
                    <span className="block font-bold text-[#111110]">Weekly Digest</span>
                    <span className="text-[11px] text-[#6E6A62]">Wednesdays 7:00 AM</span>
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setFrequency('all')}
                    className={`p-3 text-xs border text-left transition-all rounded-xs cursor-pointer ${
                      frequency === 'all'
                        ? 'border-[#EA580C] bg-[#FFF7ED] text-[#111110] font-semibold'
                        : 'border-[#E8E5DF] bg-[#F9F8F6] text-[#55524B] hover:text-[#111110]'
                    } disabled:opacity-50`}
                  >
                    <span className="block font-bold text-[#111110]">All Editions</span>
                    <span className="text-[11px] text-[#6E6A62]">Includes breaking series</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="newsletter-modal-submit-button"
                disabled={loading}
                className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded-xs shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Subscription...</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe to The Folded Letter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="pt-2 flex flex-col items-center gap-1.5">
                <p className="text-[11px] text-[#8E8A81] text-center font-mono-editorial">
                  No tracking cookies. Zero spam. Unsubscribe anytime in one click.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewsletterOpen(false);
                    window.location.hash = '/newsletter';
                  }}
                  className="text-[11px] text-[#EA580C] hover:underline font-mono-editorial cursor-pointer"
                >
                  Explore past newsletter dispatches &rarr;
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
