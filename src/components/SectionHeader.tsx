import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  rubric?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  rubric,
  title,
  subtitle,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between pb-4 mb-8 border-b border-[#262420] gap-3 ${className}`}>
      <div>
        {rubric && (
          <span className="font-mono-editorial text-[10px] font-bold uppercase tracking-widest text-[#EA580C] block mb-1">
            {rubric}
          </span>
        )}
        <h2 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#F5F3EF] leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs font-mono-editorial text-[#8C877E] mt-0.5 font-light">
            {subtitle}
          </p>
        )}
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#EA580C] hover:text-[#F97316] transition-colors self-start sm:self-auto py-1"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
