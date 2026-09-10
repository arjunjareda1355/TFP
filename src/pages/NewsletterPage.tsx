import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle2, ArrowRight, Clock, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface NewsletterPageProps {
  onBack: () => void;
}

export const NewsletterPage: React.FC<NewsletterPageProps> = ({ onBack }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<'weekly' | 'all'>('weekly');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pastEditions = [
    {
      number: 'ISSUE #142',
      date: 'May 14, 2026',
      title: 'On Silent Clocks, Arctic Grain, and the Art of the Long Walk',
      readTime: '6 min read',
      preview: 'In this edition: why mechanical clocks without second hands change perception of stress; the rediscovery of 12th-century rye in Svalbard; and the Japanese philosophy of shinrin-yoku in urban design.',
    },
    {
      number: 'ISSUE #141',
      date: 'May 07, 2026',
      title: 'The Cartography of Forgotten Islands and Sourdough Microbes',
      readTime: '5 min read',
      preview: 'In this edition: an expedition to an uncharted volcanic atoll in the Southern Ocean; the microbial lineage of a 160-year-old San Francisco starter; and why quiet luxury in architecture is replacing glass monoliths.',
    },
    {
      number: 'ISSUE #140',
      date: 'April 30, 2026',
      title: 'Why Certain Sounds Heal, and the Resurgence of Wood Joinery',
      readTime: '7 min read',
      preview: 'In this edition: psychoacoustics in medieval cathedrals; master carpenters in Takayama building earthquake-proof houses without a single nail; and five books on deep time.',
    },
  ];

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FFFFFF] text-[#111110]">
      {/* Back button */}
      <div className="mb-8 pb-4 border-b border-[#E8E5DF]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6E6A62] hover:text-[#EA580C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
      </div>

      {/* Header */}
      <header className="text-center max-w-2xl mx-auto mb-12">
        <BrandLogo variant="emblem" size={40} theme="light" className="mx-auto mb-4" />
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-3 font-mono-editorial">
          <Mail className="w-3.5 h-3.5" />
          <span>THE FOLDED LETTER</span>
        </div>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl font-medium tracking-tight text-[#111110] mb-4">
          A weekly meditation on what matters.
        </h1>
        <p className="text-sm sm:text-base text-[#55524B] leading-relaxed">
          Every Wednesday at dawn, we send a thoughtfully formatted letter comprising three deep cultural inquiries, one forgotten historical artifact, and two recommended readings.
        </p>
      </header>

      {/* Subscription Card */}
      <div className="max-w-xl mx-auto bg-[#F9F8F6] border border-[#E8E5DF] p-8 sm:p-10 mb-16 rounded-xs shadow-xs">
        {isSuccess ? (
          <div className="text-center space-y-3 py-4">
            <CheckCircle2 className="w-10 h-10 text-[#16A34A] mx-auto" />
            <h3 className="font-serif-editorial text-2xl font-medium text-[#111110]">
              You're on the subscriber ledger
            </h3>
            <p className="text-xs sm:text-sm text-[#55524B] max-w-md mx-auto leading-relaxed">
              {successMessage || (
                <>
                  We've sent a verification dispatch to <strong className="text-[#111110]">{email}</strong>. Look out for your first letter in your inbox.
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
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-mono-editorial uppercase tracking-wider text-[#6E6A62] mb-2 font-bold">
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
                <div className="flex items-center gap-1.5 text-xs text-[#DC2626] mt-2 font-mono-editorial">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono-editorial uppercase tracking-wider text-[#6E6A62] mb-2 font-bold">
                Subscription Edition
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setTier('weekly')}
                  className={`p-3 text-left border rounded-xs transition-all ${
                    tier === 'weekly'
                      ? 'border-[#EA580C] bg-[#FFF7ED] text-[#111110] font-semibold'
                      : 'border-[#E8E5DF] bg-[#FFFFFF] text-[#55524B] hover:text-[#111110]'
                  } disabled:opacity-50`}
                >
                  <span className="block text-xs font-bold text-[#111110]">The Wednesday Letter</span>
                  <span className="text-[11px] text-[#6E6A62]">1 email / week</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setTier('all')}
                  className={`p-3 text-left border rounded-xs transition-all ${
                    tier === 'all'
                      ? 'border-[#EA580C] bg-[#FFF7ED] text-[#111110] font-semibold'
                      : 'border-[#E8E5DF] bg-[#FFFFFF] text-[#55524B] hover:text-[#111110]'
                  } disabled:opacity-50`}
                >
                  <span className="block text-xs font-bold text-[#111110]">All Dispatches</span>
                  <span className="text-[11px] text-[#6E6A62]">Includes breaking series</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded-xs shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Join 45,000+ Readers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <p className="text-[11px] text-[#8E8A81] text-center font-mono-editorial">
              No sponsored advertisements. No trackers. One-click unsubscribe anytime.
            </p>
          </form>
        )}
      </div>

      {/* Archive / Sample Past Letters */}
      <div>
        <h3 className="font-mono-editorial text-xs uppercase tracking-widest text-[#8E8A81] font-bold mb-6 text-center">
          SAMPLE DISPATCHES FROM OUR ARCHIVE
        </h3>

        <div className="space-y-4">
          {pastEditions.map((item, i) => (
            <div
              key={i}
              className="p-6 bg-[#FFFFFF] border border-[#E8E5DF] hover:border-[#8E8A81] transition-all rounded-xs shadow-xs"
            >
              <div className="flex items-center justify-between text-xs font-mono-editorial text-[#6E6A62] mb-2">
                <span className="text-[#EA580C] font-bold">{item.number}</span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {item.date} • {item.readTime}
                </span>
              </div>
              <h4 className="font-serif-editorial text-xl font-medium text-[#111110] mb-2">
                {item.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#55524B] leading-relaxed">
                {item.preview}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
