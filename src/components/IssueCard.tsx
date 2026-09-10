import React from 'react';
import { MagazineIssue } from '../types';
import { BookOpen, ArrowRight } from 'lucide-react';

interface IssueCardProps {
  issue: MagazineIssue;
  onSelectIssue: (issueId: string) => void;
  className?: string;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onSelectIssue,
  className = '',
}) => {
  return (
    <article
      id={`issue-card-${issue.id}`}
      onClick={() => onSelectIssue(issue.id)}
      className={`bg-[#141312] border border-[#2C2A26] hover:border-[#EA580C] p-5 paper-edge-fold cursor-pointer group transition-all rounded-xs flex flex-col justify-between ${className}`}
    >
      <div className="space-y-4">
        {/* Cover thumbnail */}
        <div className="aspect-[3/4] overflow-hidden bg-[#181715] border border-[#2C2A26] relative">
          <img
            src={issue.coverImage}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 bg-[#121110]/90 px-2 py-0.5 text-[10px] font-mono-editorial text-[#EA580C] uppercase font-bold border border-[#3A3732] rounded-xs">
            {issue.number}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono-editorial text-[#8C877E] uppercase block mb-1">
            {issue.date} • THEME: {issue.theme}
          </span>
          <h4 className="font-serif-editorial text-xl font-medium text-[#F5F3EF] group-hover:text-[#EA580C] transition-colors leading-snug">
            {issue.title}
          </h4>
          <p className="text-xs text-[#8C877E] font-light mt-1.5 line-clamp-2">
            {issue.description}
          </p>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[#262420] flex items-center justify-between text-xs font-mono-editorial text-[#EA580C]">
        <span className="font-semibold uppercase tracking-wider">Open Volume</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </article>
  );
};
