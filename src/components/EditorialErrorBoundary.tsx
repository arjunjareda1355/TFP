import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrandLogo } from './BrandLogo';
import { EDITORIAL_ERROR_COPY, generateErrorId } from '../utils/editorialErrorCopy';
import { RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onReset?: () => void;
  sectionName?: string;
  isIsolatedSection?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

/**
 * Editorial Error Boundary for The Folded Page
 * 
 * Catches render errors gracefully and displays a calm, branded editorial fallback
 * with traceable error IDs and action recovery without blank screens or raw stack traces.
 */
export class EditorialErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[The Folded Page Error Boundary] Section "${this.props.sectionName || 'General'}":`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const copy = EDITORIAL_ERROR_COPY.PAGE.SERVER_ERROR;

      // Section-level isolated error (keeps rest of page alive)
      if (this.props.isIsolatedSection) {
        return (
          <div className="my-6 p-6 sm:p-8 bg-[#F7F5F0] border border-[#D9D6CE] rounded-xs text-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10">
              <BrandLogo variant="emblem" size={80} theme="light" />
            </div>
            <div className="relative z-10 max-w-md mx-auto space-y-3">
              <span className="text-[11px] font-mono-editorial uppercase font-bold text-[#EA580C] tracking-wider block">
                {this.props.sectionName || 'Section'} Notice
              </span>
              <h3 className="font-serif-editorial text-xl sm:text-2xl font-bold text-[#111110]">
                {this.props.fallbackTitle || "Couldn't unfold this section."}
              </h3>
              <p className="text-xs sm:text-sm text-[#5F5F5A] leading-relaxed">
                {this.props.fallbackDescription || "This portion of the page encountered a crease, but the rest of the publication remains active."}
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111110] text-white hover:bg-[#2C2A26] rounded-xs text-xs font-mono-editorial uppercase font-bold transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Full Page Error Screen
      return (
        <div className="min-h-[70vh] flex items-center justify-center bg-[#F7F5F0] px-4 py-16 text-[#171717]">
          <div className="max-w-xl w-full text-center space-y-6 bg-white p-8 sm:p-12 border border-[#D9D6CE] rounded-xs shadow-xs relative overflow-hidden">
            {/* Very faint watermark logo */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none opacity-10">
              <BrandLogo variant="emblem" size={110} theme="light" />
            </div>

            <div className="relative z-10 space-y-4 pt-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono-editorial text-[#EA580C] uppercase tracking-widest font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Editorial Dispatch</span>
              </div>

              <h1 className="font-serif-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#171717] tracking-tight leading-tight">
                {this.props.fallbackTitle || copy.title}
              </h1>

              <p className="text-sm sm:text-base text-[#5F5F5A] leading-relaxed max-w-md mx-auto">
                {this.props.fallbackDescription || copy.description}
              </p>

              <div className="pt-2 text-xs font-mono-editorial text-[#8E8A81]">
                <span>Reference: {this.state.errorId}</span>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-[#171717] text-white hover:bg-[#2C2A26] rounded-xs text-xs font-mono-editorial uppercase font-bold transition-colors shadow-xs inline-flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{copy.primaryAction}</span>
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-white border border-[#D9D6CE] text-[#171717] hover:bg-[#F7F5F0] rounded-xs text-xs font-mono-editorial uppercase font-bold transition-colors inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{copy.secondaryAction || 'Go Home'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
