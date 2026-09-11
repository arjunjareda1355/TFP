import React, { useEffect, useState } from 'react';
import { Article, ArticleContentBlock } from '../types';
import {
  Bookmark,
  Share2,
  Printer,
  Volume2,
  Square,
  ArrowLeft,
  Clock,
  Sparkles,
  ExternalLink,
  Info,
  CheckCircle,
  AlertCircle,
  Play,
} from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';
import { AuthorCard } from '../components/AuthorCard';
import { RelatedStories } from '../components/RelatedStories';
import { SaveButton } from '../components/SaveButton';
import { ShareMenu } from '../components/ShareMenu';
import { NewsletterCTA } from '../components/NewsletterCTA';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { BrandedImage } from '../components/BrandedImage';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { normalizeImageUrl, parseVideoUrl } from '../utils/mediaUtils';

interface ArticlePageProps {
  slug: string;
  onNavigateStory: (slug: string) => void;
  onNavigateCategory: (categorySlug: string) => void;
  onBack: () => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({
  slug,
  onNavigateStory,
  onNavigateCategory,
  onBack,
}) => {
  const toast = useToast();
  const {
    articles,
    isSaved,
    toggleSave,
    setShareArticle,
    playAudio,
    stopAudio,
    isPlayingAudio,
    activeAudioArticle,
    addToHistory,
    fontSize,
    setFontSize,
    readerTheme,
    setReaderTheme,
    isOwner,
  } = useMagazine();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [fetchedArticle, setFetchedArticle] = useState<Article | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [isPublishingDraft, setIsPublishingDraft] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Check local preview cache first (for real-time in-progress editor drafts)
  const localPreviewDraft = React.useMemo(() => {
    try {
      const specific = localStorage.getItem(`tfp_preview_${slug}`);
      if (specific) return JSON.parse(specific) as Article;
      const generic = localStorage.getItem('tfp_preview_article');
      if (generic) {
        const parsed = JSON.parse(generic) as Article;
        if (parsed.slug === slug || parsed.id === slug || !slug) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading local preview draft:', e);
    }
    return null;
  }, [slug]);

  const cleanLookup = React.useMemo(() => {
    return decodeURIComponent(slug || '').trim().toLowerCase();
  }, [slug]);

  // Find in context, local preview, or fetched API
  const article =
    articles.find(
      (a) =>
        a.slug === slug ||
        a.id === slug ||
        (a.title && a.title.trim().toLowerCase() === cleanLookup) ||
        (a.slug && a.slug.toLowerCase() === cleanLookup)
    ) ||
    localPreviewDraft ||
    fetchedArticle;

  const isDraftOrPreview =
    article?.status === 'DRAFT' ||
    article?.status === 'SCHEDULED' ||
    Boolean(localPreviewDraft && localPreviewDraft.id === article?.id);

  useEffect(() => {
    let isMounted = true;
    const found = articles.find(
      (a) =>
        a.slug === slug ||
        a.id === slug ||
        (a.title && a.title.trim().toLowerCase() === cleanLookup) ||
        (a.slug && a.slug.toLowerCase() === cleanLookup)
    );
    if (!found && !localPreviewDraft) {
      setIsLoadingArticle(true);
      api
        .getArticleBySlugOrId(slug)
        .then((res) => {
          if (isMounted && res) {
            setFetchedArticle(res);
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingArticle(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [slug, articles, localPreviewDraft, cleanLookup]);

  const saved = article ? isSaved(article.id) : false;
  const isThisPlaying = isPlayingAudio && activeAudioArticle?.id === article?.id;

  const handlePublishLiveNow = async () => {
    if (!article) return;
    setIsPublishingDraft(true);
    try {
      if (article.id) {
        await api.publishArticle(article.id);
      } else {
        await api.createArticle({ ...article, status: 'PUBLISHED' });
      }
      setPublishSuccess(true);
      toast.success('Draft published live to magazine readers!');
      setTimeout(() => {
        setPublishSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      toast.error('Failed to publish: ' + (err.message || 'Unknown error'));
    } finally {
      setIsPublishingDraft(false);
    }
  };

  // Track reading progress and scroll
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
    if (article?.id) {
      addToHistory(article.id, 100);
      document.title = `${article.title} — The Folded Page`;
    }

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug, article?.id]);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-base sm:text-lg leading-relaxed';
      case 'lg':
        return 'text-xl sm:text-2xl leading-relaxed';
      case 'xl':
        return 'text-2xl sm:text-3xl leading-relaxed';
      case 'base':
      default:
        return 'text-lg sm:text-xl leading-relaxed';
    }
  };

  const getThemeClass = () => {
    switch (readerTheme) {
      case 'dark':
        return 'bg-[#181715] text-[#F5F3EF]';
      case 'paper':
        return 'bg-[#FAF8F5] text-[#141414]';
      case 'white':
      default:
        return 'bg-[#FFFFFF] text-[#111110]';
    }
  };

  if (isLoadingArticle && !article) {
    return (
      <div className={`min-h-screen ${getThemeClass()} flex items-center justify-center p-8`}>
        <div className="max-w-md w-full text-center space-y-4">
          <div className="inline-block animate-spin w-8 h-8 border-2 border-[#EA580C] border-t-transparent rounded-full mb-2" />
          <h2 className="font-serif-editorial text-2xl font-medium text-[#111110]">
            Retrieving Editorial Dispatch...
          </h2>
          <p className="text-xs font-mono-editorial text-[#6E6A62]">
            Loading story typesetting, typography & assets
          </p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h2 className="font-serif-editorial text-2xl font-medium mb-4">Story not found</h2>
        <p className="text-[#6E6A62] mb-6">The requested inquiry could not be located in our archive.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-[#111110] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#333] transition-colors"
          >
            Return to Magazine
          </button>
          {isOwner && (
            <button
              onClick={() => {
                window.location.hash = '/admin/editor';
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-[#F3F4F6] text-[#111110] border border-[#E8E5DF] text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#E5E7EB] transition-colors"
            >
              Open Article Editor
            </button>
          )}
        </div>
      </div>
    );
  }

  // Related articles
  const relatedArticles = article.relatedSlugs
    ? article.relatedSlugs
        .map((s) => articles.find((a) => a.slug === s || a.id === s))
        .filter((a): a is Article => Boolean(a))
    : articles.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeClass()}`}>
      {/* Sticky Reading Progress Bar at the top of the viewport */}
      <div className="fixed top-0 inset-x-0 z-50 h-[3px] bg-transparent no-print">
        <div
          className="h-full bg-[#EA580C] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* EDITORIAL DRAFT PREVIEW BANNER */}
      {isDraftOrPreview && isOwner && (
        <div className="bg-[#FEF3C7] border-b border-[#F59E0B] text-[#92400E] px-4 py-2.5 shadow-sm sticky top-0 z-40 no-print flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#B45309] text-white font-mono-editorial text-[10px] font-bold uppercase rounded-xs tracking-wider">
              {article.status === 'SCHEDULED' ? 'Scheduled Publication' : 'Editorial Draft Preview'}
            </span>
            <span className="font-mono-editorial">
              This article is currently an unpublished draft. You are viewing live rendered layout & prose.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                window.location.hash = `/admin/editor/${article.id || ''}`;
                window.location.reload();
              }}
              className="px-3 py-1.5 bg-[#FFFFFF] border border-[#D97706] text-[#92400E] hover:bg-[#FFFBEB] font-semibold text-xs rounded-xs transition-colors"
            >
              ← Return to Editor
            </button>

            <button
              onClick={handlePublishLiveNow}
              disabled={isPublishingDraft}
              className="px-3 py-1.5 bg-[#EA580C] text-white hover:bg-[#C2410C] font-semibold text-xs rounded-xs transition-colors shadow-xs flex items-center gap-1"
            >
              {isPublishingDraft ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </>
              ) : publishSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Published!
                </>
              ) : (
                'Publish Live Now'
              )}
            </button>
          </div>
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 print-article">
        {/* Back navigation & reader tools bar */}
        <div className="flex items-center justify-between py-4 mb-8 border-b border-[#E8E5DF] no-print">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6E6A62] hover:text-[#EA580C] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Magazine</span>
          </button>

          {/* Reading Preferences toolbar */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            {/* Audio Listen */}
            <button
              onClick={() => {
                if (isThisPlaying) {
                  stopAudio();
                } else {
                  playAudio(article);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-semibold font-mono-editorial transition-colors ${
                isThisPlaying
                  ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]'
                  : 'text-[#EA580C] hover:bg-[#FFF7ED] border border-transparent'
              }`}
              title={isThisPlaying ? 'Stop listening' : 'Listen to story narration'}
            >
              {isThisPlaying ? <Square className="w-3.5 h-3.5 fill-current text-[#EA580C]" /> : <Volume2 className="w-3.5 h-3.5 text-[#EA580C]" />}
              <span>{isThisPlaying ? 'Stop Audio' : `Listen (${article.audioMinutes || Math.max(2, Math.ceil(article.readTimeMinutes || 4))}m)`}</span>
            </button>

            {/* Font size toggles */}
            <div className="flex items-center border border-[#E8E5DF] p-0.5 rounded-xs bg-[#F9F8F6]">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 text-xs rounded-xs transition-colors ${fontSize === 'sm' ? 'bg-[#EA580C] text-white font-bold' : 'text-[#6E6A62] hover:text-[#111110]'}`}
                title="Small text"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-0.5 text-xs rounded-xs transition-colors ${fontSize === 'base' ? 'bg-[#EA580C] text-white font-bold' : 'text-[#6E6A62] hover:text-[#111110]'}`}
                title="Standard text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 text-xs rounded-xs transition-colors ${fontSize === 'lg' ? 'bg-[#EA580C] text-white font-bold' : 'text-[#6E6A62] hover:text-[#111110]'}`}
                title="Large text"
              >
                A+
              </button>
            </div>

            {/* Theme switcher */}
            <div className="hidden sm:flex items-center border border-[#E8E5DF] p-0.5 rounded-xs bg-[#F9F8F6]">
              <button
                onClick={() => setReaderTheme('white')}
                className={`px-2 py-0.5 text-xs rounded-xs transition-colors ${readerTheme === 'white' ? 'bg-[#111110] text-white font-semibold' : 'text-[#6E6A62] hover:text-[#111110]'}`}
                title="White theme"
              >
                White
              </button>
              <button
                onClick={() => setReaderTheme('paper')}
                className={`px-2 py-0.5 text-xs rounded-xs transition-colors ${readerTheme === 'paper' ? 'bg-[#D97706] text-white font-semibold' : 'text-[#6E6A62] hover:text-[#111110]'}`}
                title="Paper warm theme"
              >
                Paper
              </button>
            </div>

            {/* Action buttons */}
            <button
              onClick={() => toggleSave(article.id)}
              className={`p-1.5 transition-colors ${saved ? 'text-[#EA580C]' : 'text-[#6E6A62] hover:text-[#111110]'}`}
              title={saved ? 'Remove bookmark' : 'Save story'}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => setShareArticle(article)}
              className="p-1.5 text-[#6E6A62] hover:text-[#111110] transition-colors"
              title="Share story"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex p-1.5 text-[#6E6A62] hover:text-[#111110] transition-colors"
              title="Print article"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Article Header */}
        <header className="mb-10 text-center max-w-3xl mx-auto">
          {/* Editorial Category & Flags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <button
              onClick={() => onNavigateCategory(article.category.toLowerCase())}
              className="text-xs font-bold uppercase tracking-widest text-[#EA580C] hover:underline"
            >
              {article.category}
            </button>

            {article.subcategory && (
              <>
                <span className="text-[#D4CEBF] text-xs">•</span>
                <span className="text-xs font-mono-editorial text-[#6E6A62] uppercase">
                  {article.subcategory}
                </span>
              </>
            )}

            {article.isCoverStory && (
              <span className="bg-[#111110] text-[#FFFFFF] text-[10px] font-mono-editorial uppercase px-2 py-0.5 rounded-xs tracking-wider">
                Cover Story
              </span>
            )}
            {article.isEditorsPick && (
              <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-mono-editorial uppercase px-2 py-0.5 rounded-xs tracking-wider">
                Editor's Pick
              </span>
            )}
          </div>

          <h1 className="font-serif-editorial text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] mb-6 text-[#111110]">
            {article.title}
          </h1>

          <p className="text-lg sm:text-xl font-serif-editorial italic text-[#55524B] leading-relaxed mb-8 max-w-2xl mx-auto">
            {article.deck || article.subtitle}
          </p>

          {/* Byline & Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono-editorial text-[#6E6A62] pt-4 border-t border-[#E8E5DF]">
            <div className="flex items-center gap-2">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-6 h-6 rounded-full object-cover border border-[#E8E5DF]"
              />
              <span className="font-semibold text-[#111110]">{article.author.name}</span>
            </div>
            <span>•</span>
            <span>{article.publishedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#EA580C]" />
              {article.readTime}
            </span>
            {article.seriesName && (
              <>
                <span>•</span>
                <span className="text-[#EA580C] font-semibold">{article.seriesName}</span>
              </>
            )}
            {article.issueNumber && (
              <>
                <span>•</span>
                <span>{article.issueNumber}</span>
              </>
            )}
          </div>
        </header>

        {/* Large Hero Image */}
        <div className="mb-12 overflow-hidden bg-[#F7F5F0] border border-[#E8E5DF] rounded-xs shadow-sm">
          <BrandedImage
            src={article.heroImage}
            alt={article.heroImageAlt || article.title}
            className="w-full max-h-[580px] object-cover"
            containerClassName="w-full min-h-[260px] sm:min-h-[380px]"
            fallbackText="Editorial Archival Photograph"
          />
          {(article.heroImageCaption || article.heroImageCredit) && (
            <div className="p-3 bg-[#F9F8F6] border-t border-[#E8E5DF] flex flex-col sm:flex-row justify-between text-xs text-[#6E6A62] gap-2 font-mono-editorial">
              <span>{article.heroImageCaption}</span>
              <span className="text-[#8E8A81]">{article.heroImageCredit}</span>
            </div>
          )}
        </div>

        {/* Main Article Body Blocks */}
        <div className={`max-w-2xl mx-auto space-y-6 font-serif-editorial ${getFontSizeClass()}`}>
          {article.blocks.map((block, index) => {
            // Paragraph
            if (block.type === 'paragraph') {
              const isFirstParagraph = index === 0 || block.dropCap;
              return (
                <p
                  key={index}
                  className={`leading-relaxed text-[#2C2A26] font-normal ${
                    isFirstParagraph ? 'editorial-drop-cap' : ''
                  }`}
                >
                  {block.text}
                </p>
              );
            }

            // Subheading / Heading 2
            if (block.type === 'subheading' || block.type === 'heading2') {
              return (
                <h2
                  key={index}
                  className="font-serif-editorial text-2xl sm:text-3xl font-medium tracking-tight text-[#111110] pt-6 pb-2"
                >
                  {block.text || block.title}
                </h2>
              );
            }

            // Heading 3
            if (block.type === 'heading3') {
              return (
                <h3
                  key={index}
                  className="font-serif-editorial text-xl sm:text-2xl font-medium tracking-tight text-[#111110] pt-4 pb-1"
                >
                  {block.text || block.title}
                </h3>
              );
            }

            // Pullquote
            if (block.type === 'pullquote') {
              return (
                <blockquote
                  key={index}
                  className="my-8 py-4 px-6 sm:px-8 border-l-4 border-[#EA580C] bg-[#F9F8F6] border-y border-r border-[#E8E5DF] font-serif-editorial italic text-xl sm:text-2xl text-[#111110] leading-snug rounded-xs"
                >
                  <p className="mb-2">"{block.text}"</p>
                  {block.cite && (
                    <cite className="block text-xs font-mono-editorial uppercase not-italic text-[#6E6A62]">
                      — {block.cite}
                    </cite>
                  )}
                </blockquote>
              );
            }

            // Blockquote
            if (block.type === 'blockquote') {
              return (
                <blockquote
                  key={index}
                  className="my-6 pl-5 border-l-2 border-[#111110] font-serif-editorial italic text-lg text-[#3E3B34]"
                >
                  <p className="mb-1">{block.text}</p>
                  {block.cite && (
                    <cite className="text-xs font-mono-editorial not-italic text-[#6E6A62]">
                      — {block.cite}
                    </cite>
                  )}
                </blockquote>
              );
            }

            // Highlight / Callout Box
            if (block.type === 'highlight' || block.type === 'callout') {
              const tone = block.calloutTone || 'default';
              let toneClasses = 'bg-[#FFF7ED] border-[#FED7AA] text-[#9A3412]';
              let Icon = Sparkles;

              if (tone === 'blue') {
                toneClasses = 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]';
                Icon = Info;
              } else if (tone === 'green') {
                toneClasses = 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]';
                Icon = CheckCircle;
              } else if (tone === 'rose') {
                toneClasses = 'bg-[#FFF1F2] border-[#FECDD3] text-[#9F1239]';
                Icon = AlertCircle;
              }

              return (
                <div
                  key={index}
                  className={`my-6 p-5 border text-sm sm:text-base font-sans-editorial leading-relaxed flex items-start gap-3 rounded-xs ${toneClasses}`}
                >
                  <Icon className="w-5 h-5 shrink-0 mt-0.5 text-current" />
                  <div className="space-y-1">
                    {block.title && <div className="font-semibold text-sm">{block.title}</div>}
                    <div>{block.text}</div>
                  </div>
                </div>
              );
            }

            // Bulleted or Numbered List
            if (block.type === 'list') {
              const items = block.items || [];
              if (block.ordered) {
                return (
                  <ol key={index} className="my-6 space-y-2 list-decimal list-inside text-[#2C2A26]">
                    {items.map((it, i) => (
                      <li key={i} className="pl-1 leading-relaxed">
                        <span>{it}</span>
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <ul key={index} className="my-6 space-y-2 list-disc list-inside text-[#2C2A26]">
                  {items.map((it, i) => (
                    <li key={i} className="pl-1 leading-relaxed">
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            // Divider
            if (block.type === 'divider') {
              return (
                <div key={index} className="my-10 flex items-center justify-center gap-2">
                  <span className="h-px w-16 bg-[#E8E5DF]"></span>
                  <span className="text-[#8E8A81] text-xs font-serif-editorial">❦</span>
                  <span className="h-px w-16 bg-[#E8E5DF]"></span>
                </div>
              );
            }

            // Single Image Block
            if (block.type === 'image' && block.imageUrl) {
              const normalizedSrc = normalizeImageUrl(block.imageUrl);
              return (
                <figure key={index} className="my-8">
                  <div className="overflow-hidden bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs shadow-xs">
                    <BrandedImage
                      src={normalizedSrc}
                      alt={block.imageAlt || block.imageCaption || 'Editorial photo'}
                      className="w-full object-cover max-h-[700px]"
                    />
                  </div>
                  {(block.imageCaption || block.imageCredit) && (
                    <figcaption className="mt-2 text-xs font-mono-editorial text-[#6E6A62] flex items-center justify-between gap-4">
                      <span>{block.imageCaption}</span>
                      {block.imageCredit && <span className="shrink-0 italic text-[#8E8A81]">{block.imageCredit}</span>}
                    </figcaption>
                  )}
                </figure>
              );
            }

            // Image Gallery Block
            if (block.type === 'gallery' && block.galleryImages && block.galleryImages.length > 0) {
              return (
                <div key={index} className="my-10 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {block.galleryImages.map((gImg) => (
                      <figure key={gImg.id} className="overflow-hidden bg-[#F9F8F6] border border-[#E8E5DF] rounded-xs">
                        <BrandedImage
                          src={normalizeImageUrl(gImg.url)}
                          alt={gImg.alt || gImg.caption || 'Gallery photo'}
                          className="w-full h-56 object-cover hover:scale-102 transition-transform duration-300"
                        />
                        {gImg.caption && (
                          <div className="p-2 text-[11px] font-mono-editorial text-[#6E6A62] bg-[#FFFFFF] border-t border-[#E8E5DF]">
                            {gImg.caption}
                          </div>
                        )}
                      </figure>
                    ))}
                  </div>
                </div>
              );
            }

            // Video / Embed Block
            if (block.type === 'video' || block.type === 'embed') {
              const videoData = parseVideoUrl(block.videoUrl);
              const customRatio = (block as any).videoAspectRatio || videoData?.aspectRatio || '16/9';
              
              let aspectClass = 'pb-[56.25%]'; // 16:9 widescreen
              if (customRatio === '9/16') aspectClass = 'pb-[177.77%] max-w-sm mx-auto'; // 9:16 portrait reel / short / tiktok
              else if (customRatio === '1/1') aspectClass = 'pb-[100%] max-w-md mx-auto'; // 1:1 square
              else if (customRatio === '4/3') aspectClass = 'pb-[75%]'; // 4:3 standard

              const caption = (block as any).videoCaption || block.imageCaption;
              const credit = (block as any).videoCredit || block.imageCredit;

              if (!videoData) {
                return null;
              }

              return (
                <figure key={index} className="my-8">
                  <div className="overflow-hidden rounded-xs border border-[#E8E5DF] bg-[#111110] shadow-sm">
                    {videoData.isDirectVideo ? (
                      <video
                        src={videoData.directUrl || videoData.embedUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full max-h-[600px] bg-black"
                      >
                        Your browser does not support HTML5 video playback.
                      </video>
                    ) : (
                      <div className={`relative h-0 ${aspectClass}`}>
                        <iframe
                          src={videoData.embedUrl}
                          title={videoData.platformName || 'Video dispatch'}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="absolute top-0 left-0 w-full h-full border-0"
                        />
                      </div>
                    )}
                  </div>
                  <figcaption className="mt-2 text-xs font-mono-editorial text-[#6E6A62] flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2">
                      <span className="inline-block px-1.5 py-0.5 bg-[#F4F1EA] border border-[#E2DDD3] text-[#55524B] rounded-xs text-[10px] uppercase font-bold tracking-wider">
                        {videoData.platformName}
                      </span>
                      {caption && <span>{caption}</span>}
                    </span>
                    {credit && <span className="shrink-0 italic text-[#8E8A81]">{credit}</span>}
                  </figcaption>
                </figure>
              );
            }

            // Button / Link Block
            if (block.type === 'button' && block.buttonLabel && block.buttonUrl) {
              return (
                <div key={index} className="my-8 text-center">
                  <a
                    href={block.buttonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#111110] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#EA580C] transition-colors"
                  >
                    <span>{block.buttonLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Tags list */}
        {article.tags && article.tags.length > 0 && (
          <div className="max-w-2xl mx-auto pt-10 mt-10 border-t border-[#E8E5DF] flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono-editorial uppercase text-[#6E6A62] mr-2">
              Filed under:
            </span>
            {article.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-[#F9F8F6] border border-[#E8E5DF] text-[#55524B] text-xs font-mono-editorial px-2.5 py-1 rounded-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio Card */}
        <div className="max-w-2xl mx-auto mt-12">
          <AuthorCard author={article.author} />
        </div>

        {/* Share & Save bar at the end of article */}
        <div className="max-w-2xl mx-auto mt-8 py-4 border-y border-[#E8E5DF] flex items-center justify-between no-print">
          <span className="text-xs font-serif-editorial italic text-[#55524B]">
            Enjoyed this inquiry?
          </span>
          <div className="flex items-center gap-3">
            <SaveButton article={article} showLabel />
            <ShareMenu article={article} variant="inline" />
          </div>
        </div>

        {/* Inline Newsletter CTA */}
        <div className="max-w-2xl mx-auto mt-12 no-print">
          <NewsletterCTA variant="card" />
        </div>

        {/* AdSense Unit */}
        <AdSenseUnit className="my-10 max-w-2xl mx-auto no-print" />

        {/* Keep Exploring / Related Stories Section */}
        {relatedArticles.length > 0 && (
          <div className="max-w-4xl mx-auto mt-16 no-print">
            <RelatedStories
              articles={relatedArticles}
              onSelectStory={onNavigateStory}
            />
          </div>
        )}
      </article>
    </div>
  );
};
