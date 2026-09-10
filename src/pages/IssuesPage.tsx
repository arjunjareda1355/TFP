import React, { useState, useEffect } from 'react';
import { useMagazine } from '../context/MagazineContext';
import { MAGAZINE_ISSUES } from '../data/issues';
import { ArticleCard } from '../components/ArticleCard';
import { ArrowLeft, BookOpen, Feather } from 'lucide-react';

interface IssuesPageProps {
  initialIssueId?: string;
  onSelectStory: (slug: string) => void;
  onBack: () => void;
}

export const IssuesPage: React.FC<IssuesPageProps> = ({
  initialIssueId,
  onSelectStory,
  onBack,
}) => {
  const { articles, issues } = useMagazine();
  const allIssues = issues && issues.length > 0 ? issues : MAGAZINE_ISSUES;

  const [selectedIssueId, setSelectedIssueId] = useState<string>(
    initialIssueId || allIssues[0]?.id || 'issue-01'
  );

  useEffect(() => {
    if (initialIssueId) {
      setSelectedIssueId(initialIssueId);
    }
  }, [initialIssueId]);

  const currentIssue = allIssues.find((i) => i.id === selectedIssueId) || allIssues[0] || MAGAZINE_ISSUES[0];

  // Articles in this issue
  const issueArticles = (articles || []).filter((a) =>
    (currentIssue.featuredStorySlugs && currentIssue.featuredStorySlugs.includes(a.slug)) ||
    a.issueNumber === currentIssue.number ||
    (a.issue && (a.issue === currentIssue.number || a.issue === currentIssue.id))
  );


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FFFFFF] text-[#111110]">
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
      <header className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-2 font-mono-editorial">
          <BookOpen className="w-3.5 h-3.5" />
          <span>ARCHIVAL EDITIONS</span>
        </div>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl font-medium tracking-tight text-[#111110] mb-3">
          The Quarterly Issues
        </h1>
        <p className="text-base sm:text-lg text-[#55524B] font-normal leading-relaxed">
          Curated thematic anthologies exploring the world's most fascinating crafts, places, subcultures, and enduring ideas.
        </p>
      </header>

      {/* Issue Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {allIssues.map((issue) => (
          <button
            key={issue.id}
            onClick={() => setSelectedIssueId(issue.id)}
            className={`p-4 text-left transition-all border rounded-xs ${
              issue.id === selectedIssueId
                ? 'border-[#EA580C] bg-[#FFF7ED]'
                : 'border-[#E8E5DF] bg-[#FFFFFF] hover:border-[#8E8A81]'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono-editorial uppercase tracking-widest text-[#EA580C] block mb-1 font-bold">
                {issue.number}
              </span>
              <h4 className="font-serif-editorial text-lg font-medium text-[#111110] leading-snug">
                {issue.title}
              </h4>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E8E5DF] flex items-center justify-between text-[11px] font-mono-editorial text-[#6E6A62]">
              <span>{issue.date}</span>
              <span>{issue.featuredStorySlugs?.length || 4} stories</span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Issue Showcase Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#F9F8F6] border border-[#E8E5DF] p-6 sm:p-10 mb-14 rounded-xs shadow-xs">
        <div className="lg:col-span-4 aspect-[3/4] bg-[#FFFFFF] border border-[#E8E5DF] overflow-hidden rounded-xs shadow-md">
          <img
            src={currentIssue.coverImage}
            alt={currentIssue.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-[#EA580C] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs">
              {currentIssue.number}
            </span>
            <span className="text-xs font-mono-editorial text-[#6E6A62]">
              {currentIssue.date} • {currentIssue.theme}
            </span>
          </div>

          <h2 className="font-serif-editorial text-3xl sm:text-5xl font-medium text-[#111110] leading-tight">
            {currentIssue.title}
          </h2>

          <p className="font-serif-editorial italic text-lg sm:text-xl text-[#55524B]">
            "{currentIssue.theme}"
          </p>

          <p className="text-sm sm:text-base text-[#55524B] font-normal leading-relaxed">
            {currentIssue.description}
          </p>

          {currentIssue.curatorNote && (
            <div className="mt-4 p-4 bg-[#FFFFFF] border-l-2 border-[#EA580C] border border-[#E8E5DF] text-xs font-serif-editorial italic text-[#55524B] rounded-xs">
              <div className="flex items-center gap-1.5 font-sans-editorial text-[10px] uppercase font-bold text-[#EA580C] not-italic mb-1 font-mono-editorial">
                <Feather className="w-3 h-3" />
                <span>Note From The Curators</span>
              </div>
              <p>"{currentIssue.curatorNote}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Stories in this issue */}
      <div>
        <h3 className="font-mono-editorial text-xs uppercase tracking-widest text-[#8E8A81] font-bold mb-6">
          TABLE OF CONTENTS • {issueArticles.length} ARTICLES
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {issueArticles.map((story) => (
            <div key={story.id} className="bg-[#FFFFFF] border border-[#E8E5DF] p-5 rounded-xs shadow-xs">
              <ArticleCard
                article={story}
                variant="medium"
                onSelect={onSelectStory}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
