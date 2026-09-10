import React, { useState } from 'react';
import {
  Download,
  Upload,
  Copy,
  Check,
  FileCode,
  FileText,
  X,
} from 'lucide-react';
import { Article } from '../../../types';

interface EditorExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Partial<Article>;
  onImportMarkdown: (markdown: string) => void;
}

export const EditorExportModal: React.FC<EditorExportModalProps> = ({
  isOpen,
  onClose,
  article,
  onImportMarkdown,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');

  if (!isOpen) return null;

  // Compile article to clean Markdown
  const generateMarkdown = () => {
    let md = `# ${article.title || 'Untitled'}\n\n`;
    if (article.deck) md += `*${article.deck}*\n\n`;
    if (article.author?.name) md += `**Author:** ${article.author.name}  \n`;
    if (article.category) md += `**Category:** ${article.category}  \n`;
    if (article.publishedDate) md += `**Date:** ${article.publishedDate}\n\n---\n\n`;

    if (article.heroImage) {
      md += `![${article.heroImageAlt || 'Hero Image'}](${article.heroImage})\n`;
      if (article.heroImageCaption) md += `*${article.heroImageCaption}*\n\n`;
    }

    (article.blocks || []).forEach((b) => {
      if (b.type === 'heading2') md += `## ${b.text}\n\n`;
      else if (b.type === 'heading3') md += `### ${b.text}\n\n`;
      else if (b.type === 'blockquote') md += `> ${b.text}\n>\n> — ${b.cite || 'Source'}\n\n`;
      else if (b.type === 'callout' || b.type === 'highlight') md += `> **${b.title || 'Key Insight'}**\n> ${b.text}\n\n`;
      else if (b.type === 'list') {
        (b.items || []).forEach((item, idx) => {
          md += b.ordered ? `${idx + 1}. ${item}\n` : `- ${item}\n`;
        });
        md += '\n';
      } else if (b.type === 'image') {
        md += `![${b.imageAlt || ''}](${b.imageUrl || ''})\n*${b.imageCaption || ''}*\n\n`;
      } else if (b.type === 'divider') {
        md += `---\n\n`;
      } else {
        md += `${b.text || ''}\n\n`;
      }
    });

    return md;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.slug || 'article'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(article, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.slug || 'article'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteImport = () => {
    if (!importText.trim()) return;
    onImportMarkdown(importText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 text-stone-100 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">Export & Import Suite</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Download your dispatch as Markdown, JSON, or import external drafts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-white px-6 gap-3 pt-3">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Export Formats
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Import Markdown
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadMarkdown}
                  className="p-4 rounded-xl border border-stone-200 hover:border-stone-900 bg-stone-50/40 hover:bg-white transition-all text-left group flex items-start gap-3 shadow-2xs"
                >
                  <div className="p-2.5 bg-stone-100 group-hover:bg-stone-900 text-stone-700 group-hover:text-stone-100 rounded-lg transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-stone-900">Markdown (.md)</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Formatted with headers, quotes, lists, and image references.
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="p-4 rounded-xl border border-stone-200 hover:border-stone-900 bg-stone-50/40 hover:bg-white transition-all text-left group flex items-start gap-3 shadow-2xs"
                >
                  <div className="p-2.5 bg-stone-100 group-hover:bg-stone-900 text-stone-700 group-hover:text-stone-100 rounded-lg transition-colors">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-stone-900">Structured JSON</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Complete raw database payload with metadata and content blocks.
                    </p>
                  </div>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCopyMarkdown}
                  className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Markdown to Clipboard!' : 'Copy Markdown to Clipboard'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Paste Markdown or Raw Text
                </label>
                <textarea
                  rows={8}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="# Enter your title&#10;&#10;Begin writing paragraphs..."
                  className="w-full p-3 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                />
              </div>

              <button
                onClick={handleExecuteImport}
                disabled={!importText.trim()}
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-stone-100 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Parse and Populate Article</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-stone-200 bg-stone-50/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-stone-600 hover:bg-stone-200/60 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
