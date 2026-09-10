import React from 'react';
import { MAGAZINE_ISSUES } from '../data/issues';
import { BookOpen, ArrowRight } from 'lucide-react';

interface IssuesTeaserProps {
  onSelectIssue?: (issueId: string) => void;
  onViewAllIssues?: () => void;
  onViewIssues?: () => void;
}

export const IssuesTeaser: React.FC<IssuesTeaserProps> = ({
  onSelectIssue,
  onViewAllIssues,
  onViewIssues,
}) => {
  const handleViewAll = onViewIssues || onViewAllIssues || (() => {});
  return (
    <section className="py-14 border-t border-[#E8E5DF] bg-[#F9F8F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-[#E8E5DF] gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C] mb-1 font-mono-editorial">
              <BookOpen className="w-3.5 h-3.5" />
              <span>DIGITAL PRINT ARCHIVE</span>
            </div>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#111110]">
              The Quarterly Volumes
            </h2>
          </div>
          <button
            onClick={handleViewAll}
            className="text-xs font-semibold uppercase tracking-wider text-[#EA580C] hover:text-[#C2410C] flex items-center gap-1 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <span>View All Issues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MAGAZINE_ISSUES.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onSelectIssue && onSelectIssue(issue.id)}
              className="group cursor-pointer bg-[#FFFFFF] border border-[#E8E5DF] hover:border-[#EA580C] p-4 transition-all duration-300 flex flex-col justify-between rounded-xs shadow-xs hover:shadow-md"
            >
              <div>
                <div className="aspect-[3/4] overflow-hidden bg-[#F5F4F0] border border-[#E8E5DF] mb-4 relative rounded-xs">
                  <img
                    src={issue.coverImage}
                    alt={issue.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center text-white">
                    <span className="font-mono-editorial text-[10px] uppercase tracking-widest bg-black/70 border border-white/20 px-2 py-0.5 backdrop-blur-xs rounded-xs font-bold">
                      {issue.number}
                    </span>
                    <span className="font-mono-editorial text-[10px] text-[#E5E5E0]">
                      {issue.date}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-mono-editorial uppercase text-[#EA580C] tracking-wider block mb-0.5 font-bold">
                      Theme
                    </span>
                    <h4 className="font-serif-editorial text-lg font-bold leading-tight">
                      {issue.theme}
                    </h4>
                  </div>
                </div>

                <h3 className="font-serif-editorial text-xl font-medium text-[#111110] group-hover:text-[#EA580C] transition-colors mb-1">
                  {issue.title}
                </h3>
                <p className="text-xs text-[#55524B] line-clamp-2 leading-relaxed">
                  {issue.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E8E5DF] flex items-center justify-between text-xs text-[#8E8A81]">
                <span className="font-mono-editorial">{issue.featuredStorySlugs.length} Articles</span>
                <span className="font-medium text-[#111110] group-hover:text-[#EA580C] flex items-center gap-1">
                  Open Issue <ArrowRight className="w-3 h-3 text-[#EA580C]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
