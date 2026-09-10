import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Send,
  Eye,
  Clock,
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Link,
  Film,
  List,
  Quote,
  Heading2,
  Heading3,
  AlignLeft,
  CheckCircle2,
  AlertCircle,
  History,
  Upload,
  Globe,
  Settings,
  Layers,
  HelpCircle,
  X,
  ExternalLink,
  RotateCcw,
  Check,
  RefreshCw,
  FileText,
  Volume2,
  Columns,
  Maximize2,
  Archive,
  Download,
  Award,
} from 'lucide-react';
import { useMagazine } from '../../context/MagazineContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import {
  Article,
  ArticleContentBlock,
  ArticleStatus,
  Author,
  CategoryInfo,
} from '../../types';

import { EditorHeader, EditorViewMode } from './editor/EditorHeader';
import { EditorContentBlocks } from './editor/EditorContentBlocks';
import { EditorMetadataTab } from './editor/EditorMetadataTab';
import { EditorSeoTab } from './editor/EditorSeoTab';
import { EditorPreviewTab } from './editor/EditorPreviewTab';
import { EditorFocusMode } from './editor/EditorFocusMode';
import { EditorSplitPreview } from './editor/EditorSplitPreview';
import { EditorReadinessWidget } from './editor/EditorReadinessWidget';
import { EditorTemplatesModal, ArticleTemplate } from './editor/EditorTemplatesModal';
import { EditorDraftVaultModal } from './editor/EditorDraftVaultModal';
import { EditorAiAssistantModal } from './editor/EditorAiAssistantModal';
import { EditorExportModal } from './editor/EditorExportModal';

interface AdminArticleEditorProps {
  articleId?: string | null;
  onBack: () => void;
  onPreview: (slug: string) => void;
}

export const AdminArticleEditor: React.FC<AdminArticleEditorProps> = ({
  articleId,
  onBack,
  onPreview,
}) => {
  const { categories, authors, series, issues, refreshArticles, currentUser } = useMagazine();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'metadata' | 'seo' | 'preview'>('content');
  const [viewMode, setViewMode] = useState<EditorViewMode>('studio');

  // Modals
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRevisionDrawerOpen, setIsRevisionDrawerOpen] = useState(false);

  // Auto-save & Local persistence state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'synced' | 'local_saved' | 'restored'>('idle');
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('');
  const [localBackupPrompt, setLocalBackupPrompt] = useState<{ title: string; updatedAt: string; data: any } | null>(null);

  // Core Form State
  const [id, setId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [deck, setDeck] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [category, setCategory] = useState<string>('Culture');
  const [subcategory, setSubcategory] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['Culture', 'Discovery']);
  const [authorId, setAuthorId] = useState<string>('auth-01');
  const [seriesName, setSeriesName] = useState<string>('');
  const [issueNumber, setIssueNumber] = useState<string>('');
  const [status, setStatus] = useState<ArticleStatus>('DRAFT');
  const [scheduledPublishDate, setScheduledPublishDate] = useState<string>('');

  // Hero Artwork
  const [heroImage, setHeroImage] = useState<string>(
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=80'
  );
  const [heroImageAlt, setHeroImageAlt] = useState<string>('');
  const [heroImageCaption, setHeroImageCaption] = useState<string>('');
  const [heroImageCredit, setHeroImageCredit] = useState<string>('');
  const [heroImageSourceUrl, setHeroImageSourceUrl] = useState<string>('');

  // Flags & Placement
  const [isCoverStory, setIsCoverStory] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isEditorsPick, setIsEditorsPick] = useState(false);
  const [isUnique, setIsUnique] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);
  const [popularityRank, setPopularityRank] = useState<number>(10);

  // SEO & Social
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Audio & Read Time
  const [audioMinutes, setAudioMinutes] = useState<number | undefined>(undefined);
  const [customReadTime, setCustomReadTime] = useState<string>('');

  // Content Blocks
  const [blocks, setBlocks] = useState<ArticleContentBlock[]>([
    {
      type: 'paragraph',
      text: 'Begin typing the opening lines of your dispatch here...',
      dropCap: true,
    },
    {
      type: 'heading2',
      text: 'The Architecture of the Idea',
    },
    {
      type: 'paragraph',
      text: 'Describe the core discovery, cultural phenomenon, or inquiry in detail.',
    },
  ]);

  // Revisions history
  const [revisions, setRevisions] = useState<any[]>([]);

  // 1. Initial Load: Existing article or Unsaved Local Session
  useEffect(() => {
    if (articleId) {
      setIsLoading(true);
      api
        .getArticleBySlugOrId(articleId)
        .then((art) => {
          if (art) {
            populateArticleState(art);

            // Check if local backup has newer unsaved edits
            try {
              const localBackup = localStorage.getItem(`tfp_draft_autosave_${art.id}`);
              if (localBackup) {
                const parsed = JSON.parse(localBackup);
                if (parsed.updatedAt && parsed.title && parsed.title !== art.title) {
                  setLocalBackupPrompt({
                    title: parsed.title,
                    updatedAt: new Date(parsed.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    data: parsed,
                  });
                }
              }
            } catch {}
          }
        })
        .catch((err) => {
          setErrorMessage('Could not load article data: ' + err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // New Article
      const newId = `story-${Date.now()}`;
      setId(newId);
      setTitle('');
      setSlug('');

      // Check if there was an unsaved draft from a previous session
      try {
        const storedNew = localStorage.getItem('tfp_draft_autosave_new');
        if (storedNew) {
          const parsed = JSON.parse(storedNew);
          if (parsed.title || (parsed.blocks && parsed.blocks.length > 1)) {
            setLocalBackupPrompt({
              title: parsed.title || 'Untitled Draft',
              updatedAt: parsed.updatedAt
                ? new Date(parsed.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'previous session',
              data: parsed,
            });
          }
        }
      } catch {}
    }
  }, [articleId]);

  const populateArticleState = (art: Partial<Article>) => {
    if (art.id) setId(art.id);
    if (art.title !== undefined) setTitle(art.title);
    if (art.subtitle !== undefined) setSubtitle(art.subtitle);
    if (art.deck !== undefined) setDeck(art.deck || art.subtitle || '');
    if (art.slug !== undefined) setSlug(art.slug);
    if (art.category !== undefined) setCategory(art.category);
    if (art.subcategory !== undefined) setSubcategory(art.subcategory || '');
    if (art.tags !== undefined) setTags(art.tags || []);
    if (art.author?.id) setAuthorId(art.author.id);
    if (art.seriesName !== undefined) setSeriesName(art.seriesName || '');
    if (art.issueNumber !== undefined) setIssueNumber(art.issueNumber || '');
    if (art.status !== undefined) setStatus(art.status || 'DRAFT');
    if (art.scheduledPublishDate !== undefined) setScheduledPublishDate(art.scheduledPublishDate || '');
    if (art.heroImage !== undefined) setHeroImage(art.heroImage);
    if (art.heroImageAlt !== undefined) setHeroImageAlt(art.heroImageAlt || '');
    if (art.heroImageCaption !== undefined) setHeroImageCaption(art.heroImageCaption || '');
    if (art.heroImageCredit !== undefined) setHeroImageCredit(art.heroImageCredit || '');
    if (art.heroImageSourceUrl !== undefined) setHeroImageSourceUrl(art.heroImageSourceUrl || '');
    if (art.isCoverStory !== undefined) setIsCoverStory(Boolean(art.isCoverStory));
    if (art.isTrending !== undefined) setIsTrending(Boolean(art.isTrending));
    if (art.isEditorsPick !== undefined) setIsEditorsPick(Boolean(art.isEditorsPick));
    if (art.isUnique !== undefined) setIsUnique(Boolean(art.isUnique));
    if (art.isSpecial !== undefined) setIsSpecial(Boolean(art.isSpecial));
    if (art.popularityRank !== undefined) setPopularityRank(art.popularityRank || 10);
    if (art.metaTitle !== undefined) setMetaTitle(art.metaTitle || '');
    if (art.metaDescription !== undefined) setMetaDescription(art.metaDescription || '');
    if (art.canonicalUrl !== undefined) setCanonicalUrl(art.canonicalUrl || '');
    if (art.audioMinutes !== undefined) setAudioMinutes(art.audioMinutes);
    if (art.readTime !== undefined) setCustomReadTime(art.readTime || '');
    if (art.blocks && art.blocks.length > 0) setBlocks(art.blocks);
    if (art.revisions) setRevisions(art.revisions);
  };

  // Auto-slug generator from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!articleId && (!slug || slug.startsWith('story-'))) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Total word count and read time
  const totalWords =
    blocks.reduce((acc, b) => {
      const text = b.text || b.title || (b.items ? b.items.join(' ') : '');
      return acc + (text ? text.trim().split(/\s+/).length : 0);
    }, 0) +
    (title ? title.trim().split(/\s+/).length : 0) +
    (deck ? deck.trim().split(/\s+/).length : 0);

  const calculatedReadTimeMinutes = Math.max(1, Math.ceil(totalWords / 220));
  const displayReadTime = customReadTime || `${calculatedReadTimeMinutes} min read`;

  // Compile full article payload
  const compileArticlePayload = (overrideStatus?: ArticleStatus): Partial<Article> => {
    const currentAuthor =
      authors.find((a) => a.id === authorId) ||
      authors[0] || {
        id: 'auth-01',
        name: 'The Folded Page Editorial Desk',
        role: 'Staff Writer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Dispatches curated by the editors.',
      };

    const finalStatus = overrideStatus || status || 'DRAFT';
    const finalSlug =
      (slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, '') ||
      `story-${Date.now()}`;

    return {
      id: id || articleId || `story-${Date.now()}`,
      title: title.trim() || 'Untitled Dispatch',
      subtitle: subtitle.trim() || deck.trim(),
      deck: deck.trim() || subtitle.trim(),
      slug: finalSlug,
      category,
      subcategory: subcategory.trim(),
      tags: tags.length > 0 ? tags : ['Culture'],
      author: currentAuthor,
      authorId: currentAuthor.id,
      seriesName: seriesName.trim() || undefined,
      issueNumber: issueNumber.trim() || undefined,
      status: finalStatus,
      scheduledPublishDate: scheduledPublishDate || undefined,
      heroImage:
        heroImage.trim() ||
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=80',
      heroImageAlt: heroImageAlt.trim() || title.trim(),
      heroImageCaption: heroImageCaption.trim(),
      heroImageCredit: heroImageCredit.trim(),
      heroImageSourceUrl: heroImageSourceUrl.trim(),
      isCoverStory,
      isTrending,
      isEditorsPick,
      isUnique,
      isSpecial,
      popularityRank,
      readTime: displayReadTime,
      readTimeMinutes: calculatedReadTimeMinutes,
      audioMinutes: audioMinutes || Math.ceil(calculatedReadTimeMinutes * 0.9),
      seoTitle: metaTitle.trim() || title.trim(),
      seoDescription: metaDescription.trim() || deck.trim() || subtitle.trim(),
      metaTitle: metaTitle.trim() || title.trim(),
      metaDescription: metaDescription.trim() || deck.trim() || subtitle.trim(),
      canonicalUrl: canonicalUrl.trim(),
      blocks: blocks.length > 0 ? blocks : [{ type: 'paragraph', text: 'Start crafting your inquiry here.' }],
    };
  };

  // Instant Local Storage Snapshot for zero-data-loss safety
  const saveSnapshotToStorage = () => {
    if (!title && blocks.length <= 1 && !blocks[0]?.text) return;
    const payload = compileArticlePayload();
    const storageKey = articleId
      ? `tfp_draft_autosave_${articleId}`
      : id
      ? `tfp_draft_autosave_${id}`
      : 'tfp_draft_autosave_new';
    try {
      const dataWithTimestamp = { ...payload, updatedAt: new Date().toISOString() };
      localStorage.setItem(storageKey, JSON.stringify(dataWithTimestamp));
      localStorage.setItem('tfp_preview_article', JSON.stringify(payload));
      if (payload.slug) {
        localStorage.setItem(`tfp_preview_${payload.slug}`, JSON.stringify(payload));
      }
      if (payload.id) {
        localStorage.setItem(`tfp_preview_${payload.id}`, JSON.stringify(payload));
      }
    } catch (e) {
      console.warn('Local snapshot save error:', e);
    }
  };

  // Emergency safety on tab close or page reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveSnapshotToStorage();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      saveSnapshotToStorage();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [title, subtitle, deck, slug, category, subcategory, tags, authorId, heroImage, blocks, id, articleId]);

  // Debounced LocalStorage Auto-Save (500ms)
  useEffect(() => {
    if (!title.trim() && blocks.length <= 1 && !blocks[0]?.text) return;

    const timer = setTimeout(() => {
      saveSnapshotToStorage();
      setAutoSaveStatus((prev) => (prev === 'synced' ? 'synced' : 'local_saved'));
    }, 500);

    return () => clearTimeout(timer);
  }, [
    title,
    subtitle,
    deck,
    slug,
    category,
    subcategory,
    tags,
    authorId,
    heroImage,
    heroImageCaption,
    heroImageCredit,
    blocks,
    isCoverStory,
    isTrending,
    isEditorsPick,
    isUnique,
    isSpecial,
  ]);

  // Debounced Background Cloud Sync (2.5s)
  useEffect(() => {
    if (!title.trim() || isLoading) return;

    const timer = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        const draftPayload = compileArticlePayload('DRAFT');

        if (articleId) {
          await api.updateArticle(articleId, draftPayload);
        } else {
          const created = await api.createArticle({ ...draftPayload, id, status: 'DRAFT' });
          if (created?.id) {
            setId(created.id);
            if (window.location.hash !== `#/admin/editor/${created.id}`) {
              window.location.hash = `#/admin/editor/${created.id}`;
            }
          }
        }

        const nowStr = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastAutoSaveTime(nowStr);
        setAutoSaveStatus('synced');
        refreshArticles();
      } catch (err) {
        console.warn('Background auto-sync note:', err);
        setAutoSaveStatus('local_saved');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [
    title,
    subtitle,
    deck,
    slug,
    category,
    subcategory,
    tags,
    authorId,
    heroImage,
    blocks,
    isCoverStory,
    isTrending,
    isEditorsPick,
    isUnique,
    isSpecial,
    articleId,
    id,
    isLoading,
  ]);

  // Block Manipulation Handlers
  const handleAddBlock = (type: ArticleContentBlock['type'], atIndex?: number) => {
    const newBlock: ArticleContentBlock = {
      type,
      text: '',
    };
    if (type === 'callout' || type === 'highlight') {
      newBlock.calloutTone = 'default';
      newBlock.title = 'Key Insight';
    }
    if (type === 'list') {
      newBlock.items = ['First observation', 'Second observation'];
      newBlock.ordered = false;
    }
    if (type === 'gallery') {
      newBlock.galleryImages = [];
    }

    if (atIndex !== undefined) {
      setBlocks((prev) => {
        const next = [...prev];
        next.splice(atIndex + 1, 0, newBlock);
        return next;
      });
    } else {
      setBlocks([...blocks, newBlock]);
    }
  };

  const handleUpdateBlock = (index: number, updates: Partial<ArticleContentBlock>) => {
    setBlocks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setBlocks((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleDuplicateBlock = (index: number) => {
    setBlocks((prev) => {
      const next = [...prev];
      const copy = JSON.parse(JSON.stringify(next[index]));
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const handleDeleteBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  // Restore Unsaved Local Draft
  const handleRestoreLocalDraft = () => {
    if (!localBackupPrompt?.data) return;
    populateArticleState(localBackupPrompt.data);
    setLocalBackupPrompt(null);
    setAutoSaveStatus('restored');
    toast?.showToast('Restored draft from previous session.', 'success');
  };

  // Manual Save Draft / Publish
  const handleSave = async (targetStatus?: ArticleStatus) => {
    if (!title.trim()) {
      setErrorMessage('Please enter an article title before saving.');
      return;
    }

    const finalStatus = targetStatus || status;
    const payload = compileArticlePayload(finalStatus);

    setIsSaving(true);
    setErrorMessage('');
    try {
      let saved: Article;
      const isExistingOnServer = Boolean(articleId);

      if (finalStatus === 'PUBLISHED' && isExistingOnServer) {
        saved = await api.publishArticle(articleId!, payload);
      } else if (isExistingOnServer) {
        saved = await api.updateArticle(articleId!, payload);
      } else {
        saved = await api.createArticle({ ...payload, id, status: finalStatus });
      }

      if (saved) {
        setId(saved.id);
        if (saved.slug) setSlug(saved.slug);
        setStatus(saved.status || finalStatus);
        if (saved.revisions) setRevisions(saved.revisions);
        if (window.location.hash !== `#/admin/editor/${saved.id}`) {
          window.location.hash = `#/admin/editor/${saved.id}`;
        }
      }

      await refreshArticles();

      const nowStr = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastAutoSaveTime(nowStr);
      setAutoSaveStatus('synced');

      setSaveSuccessMessage(
        finalStatus === 'PUBLISHED'
          ? 'Story published live to The Folded Page!'
          : 'Article draft saved successfully to database & cloud vault.'
      );
      setTimeout(() => setSaveSuccessMessage(''), 5000);
      toast?.showToast(
        finalStatus === 'PUBLISHED' ? 'Article published live!' : 'Article draft saved securely.',
        'success'
      );
    } catch (err: any) {
      console.warn('Save error, recovering via local snapshot:', err);
      saveSnapshotToStorage();
      setSaveSuccessMessage('Saved to local vault (will sync to cloud momentarily).');
      setTimeout(() => setSaveSuccessMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Apply Template
  const handleSelectTemplate = (tmpl: ArticleTemplate) => {
    if (tmpl.deck && !deck) setDeck(tmpl.deck);
    if (tmpl.category) setCategory(tmpl.category);
    if (tmpl.tags && tmpl.tags.length > 0) {
      const merged = Array.from(new Set([...tags, ...tmpl.tags]));
      setTags(merged);
    }
    if (tmpl.blocks && tmpl.blocks.length > 0) {
      setBlocks(tmpl.blocks);
    }
    toast?.showToast(`Applied ${tmpl.name} template.`, 'info');
  };

  // Load draft from vault
  const handleLoadDraftFromVault = (d: Article) => {
    populateArticleState(d);
    toast?.showToast(`Opened draft: "${d.title || 'Untitled'}"`, 'info');
  };

  // Import from Markdown
  const handleImportMarkdown = (md: string) => {
    const lines = md.split('\n');
    let importedTitle = '';
    let importedDeck = '';
    const importedBlocks: ArticleContentBlock[] = [];

    let currentParagraph = '';

    const flushParagraph = () => {
      if (currentParagraph.trim()) {
        importedBlocks.push({
          type: 'paragraph',
          text: currentParagraph.trim(),
          dropCap: importedBlocks.length === 0,
        });
        currentParagraph = '';
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ') && !importedTitle) {
        flushParagraph();
        importedTitle = trimmed.replace(/^#\s+/, '');
      } else if (trimmed.startsWith('## ')) {
        flushParagraph();
        importedBlocks.push({ type: 'heading2', text: trimmed.replace(/^##\s+/, '') });
      } else if (trimmed.startsWith('### ')) {
        flushParagraph();
        importedBlocks.push({ type: 'heading3', text: trimmed.replace(/^###\s+/, '') });
      } else if (trimmed.startsWith('> ')) {
        flushParagraph();
        importedBlocks.push({ type: 'blockquote', text: trimmed.replace(/^>\s+/, '') });
      } else if (trimmed.startsWith('---')) {
        flushParagraph();
        importedBlocks.push({ type: 'divider' });
      } else if (!trimmed) {
        flushParagraph();
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + trimmed;
      }
    });
    flushParagraph();

    if (importedTitle) setTitle(importedTitle);
    if (importedBlocks.length > 0) setBlocks(importedBlocks);
    toast?.showToast('Parsed and populated markdown draft.', 'success');
  };

  const selectedAuthor = authors.find((a) => a.id === authorId) || authors[0];

  // If in Zen Focus Mode:
  if (viewMode === 'focus') {
    return (
      <EditorFocusMode
        title={title}
        subtitle={subtitle}
        deck={deck}
        blocks={blocks}
        totalWords={totalWords}
        readTime={displayReadTime}
        autoSaveStatus={autoSaveStatus}
        onTitleChange={handleTitleChange}
        onSubtitleChange={setSubtitle}
        onDeckChange={setDeck}
        onUpdateBlock={handleUpdateBlock}
        onAddBlock={handleAddBlock}
        onDeleteBlock={handleDeleteBlock}
        onExitFocus={() => setViewMode('studio')}
        onSaveDraft={() => handleSave('DRAFT')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans">
      {/* 1. Master Top Header Toolbar */}
      <EditorHeader
        title={title}
        status={status}
        autoSaveStatus={autoSaveStatus}
        lastAutoSaveTime={lastAutoSaveTime}
        isSaving={isSaving}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onBack={onBack}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onSaveDraft={() => handleSave('DRAFT')}
        onPublish={() => handleSave('PUBLISHED')}
      />

      {/* 2. Messages & Session Recovery Banner */}
      {localBackupPrompt && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Unsaved session draft detected:</strong> "{localBackupPrompt.title}" from {localBackupPrompt.updatedAt}.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRestoreLocalDraft}
              className="px-3 py-1 bg-amber-900 text-amber-50 rounded-lg font-semibold hover:bg-amber-800 transition-colors"
            >
              Restore Draft
            </button>
            <button
              onClick={() => setLocalBackupPrompt(null)}
              className="px-2.5 py-1 text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {saveSuccessMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button onClick={() => setSaveSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between text-xs text-rose-900 font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-700 hover:text-rose-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 min-w-0">
        {viewMode === 'split' ? (
          <EditorSplitPreview
            title={title}
            subtitle={subtitle}
            deck={deck}
            category={category}
            blocks={blocks}
            author={selectedAuthor}
            heroImage={heroImage}
            heroImageAlt={heroImageAlt}
            heroImageCaption={heroImageCaption}
            heroImageCredit={heroImageCredit}
            readTime={displayReadTime}
            audioMinutes={audioMinutes}
            onTitleChange={handleTitleChange}
            onSubtitleChange={setSubtitle}
            onDeckChange={setDeck}
            onAddBlock={handleAddBlock}
            onUpdateBlock={handleUpdateBlock}
            onMoveBlock={handleMoveBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onDeleteBlock={handleDeleteBlock}
          />
        ) : (
          /* Studio Layout with Tabbed Sections + Sidebar */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start min-w-0">
            {/* Left 2 Columns: Main Editing Canvas */}
            <div className="lg:col-span-2 space-y-6 min-w-0">
              {/* Studio Tabs Navigation */}
              <div className="flex items-center border-b border-stone-200 bg-white px-4 rounded-xl border shadow-2xs gap-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`py-3.5 text-xs font-serif font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'content'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Content & Narrative</span>
                </button>
                <button
                  onClick={() => setActiveTab('metadata')}
                  className={`py-3.5 text-xs font-serif font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'metadata'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Artwork & Taxonomy</span>
                </button>
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`py-3.5 text-xs font-serif font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'seo'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>SEO & Social</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`py-3.5 text-xs font-serif font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Magazine Preview</span>
                </button>
              </div>

              {/* Tab 1: Content & Narrative */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  {/* Article Title & Deck Box */}
                  <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <div>
                      <label className="block text-xs font-serif font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                        Story Headline
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Craft an arresting headline..."
                        className="w-full text-2xl sm:text-3xl font-serif font-bold text-stone-950 p-3 bg-stone-50/60 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all leading-tight"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-serif font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                        Editorial Deck / Excerpt
                      </label>
                      <textarea
                        rows={2}
                        value={deck || subtitle}
                        onChange={(e) => {
                          setDeck(e.target.value);
                          setSubtitle(e.target.value);
                        }}
                        placeholder="A concise, poetic summary establishing context and intellectual inquiry..."
                        className="w-full text-sm font-serif italic text-stone-700 p-3 bg-stone-50/60 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Modular Blocks */}
                  <EditorContentBlocks
                    blocks={blocks}
                    onAddBlock={handleAddBlock}
                    onUpdateBlock={handleUpdateBlock}
                    onMoveBlock={handleMoveBlock}
                    onDuplicateBlock={handleDuplicateBlock}
                    onDeleteBlock={handleDeleteBlock}
                  />
                </div>
              )}

              {/* Tab 2: Metadata & Visuals */}
              {activeTab === 'metadata' && (
                <EditorMetadataTab
                  category={category}
                  subcategory={subcategory}
                  tags={tags}
                  authorId={authorId}
                  seriesName={seriesName}
                  issueNumber={issueNumber}
                  status={status}
                  scheduledPublishDate={scheduledPublishDate}
                  heroImage={heroImage}
                  heroImageAlt={heroImageAlt}
                  heroImageCaption={heroImageCaption}
                  heroImageCredit={heroImageCredit}
                  heroImageSourceUrl={heroImageSourceUrl}
                  isCoverStory={isCoverStory}
                  isTrending={isTrending}
                  isEditorsPick={isEditorsPick}
                  isUnique={isUnique}
                  isSpecial={isSpecial}
                  popularityRank={popularityRank}
                  audioMinutes={audioMinutes}
                  customReadTime={customReadTime}
                  categories={categories}
                  authors={authors}
                  series={series}
                  issues={issues}
                  onCategoryChange={setCategory}
                  onSubcategoryChange={setSubcategory}
                  onTagsChange={setTags}
                  onAuthorIdChange={setAuthorId}
                  onSeriesNameChange={setSeriesName}
                  onIssueNumberChange={setIssueNumber}
                  onStatusChange={setStatus}
                  onScheduledDateChange={setScheduledPublishDate}
                  onHeroImageChange={setHeroImage}
                  onHeroImageAltChange={setHeroImageAlt}
                  onHeroImageCaptionChange={setHeroImageCaption}
                  onHeroImageCreditChange={setHeroImageCredit}
                  onHeroImageSourceUrlChange={setHeroImageSourceUrl}
                  onIsCoverStoryChange={setIsCoverStory}
                  onIsTrendingChange={setIsTrending}
                  onIsEditorsPickChange={setIsEditorsPick}
                  onIsUniqueChange={setIsUnique}
                  onIsSpecialChange={setIsSpecial}
                  onPopularityRankChange={setPopularityRank}
                  onAudioMinutesChange={setAudioMinutes}
                  onCustomReadTimeChange={setCustomReadTime}
                />
              )}

              {/* Tab 3: SEO & Social */}
              {activeTab === 'seo' && (
                <EditorSeoTab
                  title={title}
                  deck={deck}
                  slug={slug}
                  metaTitle={metaTitle}
                  metaDescription={metaDescription}
                  canonicalUrl={canonicalUrl}
                  heroImage={heroImage}
                  onSlugChange={setSlug}
                  onMetaTitleChange={setMetaTitle}
                  onMetaDescriptionChange={setMetaDescription}
                  onCanonicalUrlChange={setCanonicalUrl}
                />
              )}

              {/* Tab 4: Live Preview */}
              {activeTab === 'preview' && (
                <EditorPreviewTab
                  article={compileArticlePayload()}
                  author={selectedAuthor}
                />
              )}
            </div>

            {/* Right Column: Editorial Intelligence & Publishing Sidebar */}
            <div className="space-y-6 min-w-0">
              {/* Publication Readiness Checklist Widget */}
              <EditorReadinessWidget
                title={title}
                deck={deck}
                category={category}
                tags={tags}
                heroImage={heroImage}
                heroImageAlt={heroImageAlt}
                metaDescription={metaDescription}
                blocks={blocks}
                totalWords={totalWords}
              />

              {/* Realtime Story Metrics */}
              <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-3 shadow-2xs">
                <h4 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                  Telemetry & Reader Timing
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="block text-[10px] uppercase font-mono text-stone-400">Total Words</span>
                    <span className="text-xl font-serif font-bold text-stone-900">{totalWords}</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="block text-[10px] uppercase font-mono text-stone-400">Estimated Read</span>
                    <span className="text-xl font-serif font-bold text-stone-900">{displayReadTime}</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-stone-500 flex items-center justify-between">
                  <span>Audio Narration:</span>
                  <span className="font-semibold text-stone-800">
                    {audioMinutes || Math.ceil(calculatedReadTimeMinutes * 0.9)} minutes
                  </span>
                </div>
              </div>

              {/* Quick Jump & Tools */}
              <div className="p-5 bg-white border border-stone-200 rounded-xl space-y-2.5 shadow-2xs">
                <h4 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider mb-2">
                  Editorial Accelerators
                </h4>

                <button
                  onClick={() => setIsTemplatesOpen(true)}
                  className="w-full py-2 px-3 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-medium rounded-lg flex items-center justify-between transition-colors border border-stone-200"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    <span>Starter Templates</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">5 layouts</span>
                </button>

                <button
                  onClick={() => setIsAiOpen(true)}
                  className="w-full py-2 px-3 bg-amber-50/80 hover:bg-amber-100/80 text-amber-950 text-xs font-medium rounded-lg flex items-center justify-between transition-colors border border-amber-200"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI Co-Pilot (Headlines & Decks)</span>
                  </span>
                  <span className="text-[10px] text-amber-700 font-mono">Assist</span>
                </button>

                <button
                  onClick={() => setIsVaultOpen(true)}
                  className="w-full py-2 px-3 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-medium rounded-lg flex items-center justify-between transition-colors border border-stone-200"
                >
                  <span className="flex items-center gap-2">
                    <Archive className="w-3.5 h-3.5 text-stone-500" />
                    <span>Browse Draft Vault</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Backups</span>
                </button>

                <button
                  onClick={() => setIsExportOpen(true)}
                  className="w-full py-2 px-3 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-medium rounded-lg flex items-center justify-between transition-colors border border-stone-200"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-stone-500" />
                    <span>Export / Import Suite</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">MD / JSON</span>
                </button>

                {revisions.length > 0 && (
                  <button
                    onClick={() => setIsRevisionDrawerOpen(!isRevisionDrawerOpen)}
                    className="w-full py-2 px-3 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-medium rounded-lg flex items-center justify-between transition-colors border border-stone-200"
                  >
                    <span className="flex items-center gap-2">
                      <History className="w-3.5 h-3.5 text-stone-500" />
                      <span>Version History</span>
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {revisions.length} saves
                    </span>
                  </button>
                )}
              </div>

              {/* Revisions History Drawer */}
              {isRevisionDrawerOpen && revisions.length > 0 && (
                <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3 shadow-2xs animate-fade-in">
                  <h4 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                    Recent Save Revisions
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {revisions.map((rev, revIdx) => (
                      <div
                        key={rev.id || revIdx}
                        className="p-2.5 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 text-xs flex items-center justify-between transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-stone-800">
                            {new Date(rev.timestamp || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {rev.authorName || 'Editorial Staff'} • {rev.summary || 'Content updated'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (rev.data) {
                              populateArticleState(rev.data);
                              toast?.showToast('Restored revision snapshot.', 'info');
                            }
                          }}
                          className="px-2 py-1 bg-stone-900 text-stone-100 text-[10px] font-semibold rounded hover:bg-amber-900 transition-colors"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 4. Modals */}
      <EditorTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <EditorDraftVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        onLoadDraft={handleLoadDraftFromVault}
      />

      <EditorAiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        title={title}
        deck={deck}
        category={category}
        blocks={blocks}
        onApplyTitle={setTitle}
        onApplyDeck={setDeck}
        onApplyTags={setTags}
        onAddBlock={(b) => handleAddBlock(b.type)}
      />

      <EditorExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        article={compileArticlePayload()}
        onImportMarkdown={handleImportMarkdown}
      />
    </div>
  );
};
