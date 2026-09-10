import React from 'react';
import { Play, Pause, X, Volume2, SkipBack, SkipForward, Sparkles, LogOut } from 'lucide-react';
import { useMagazine } from '../context/MagazineContext';
import { BrandLogo } from './BrandLogo';

export const AudioPlayerBar: React.FC = () => {
  const {
    activeAudioArticle,
    isPlayingAudio,
    toggleAudioPlay,
    stopAudio,
    audioProgress,
    setAudioProgress,
    audioSpeed,
    setAudioSpeed,
  } = useMagazine();

  if (!activeAudioArticle) return null;

  const totalSeconds = (activeAudioArticle.audioMinutes || 6) * 60;
  const currentSeconds = Math.floor((audioProgress / 100) * totalSeconds);
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleSpeedToggle = () => {
    if (audioSpeed === 1) setAudioSpeed(1.25);
    else if (audioSpeed === 1.25) setAudioSpeed(1.5);
    else if (audioSpeed === 1.5) setAudioSpeed(2);
    else setAudioSpeed(1);
  };

  const handleSeek = (newVal: number) => {
    setAudioProgress(newVal);
  };

  return (
    <aside
      role="region"
      aria-label="Audio Story Player"
      className="fixed bottom-0 inset-x-0 z-50 bg-[#FFFFFF] text-[#111110] border-t-2 border-[#EA580C] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] py-3 px-4 sm:px-6 transition-all duration-300 animate-in slide-in-from-bottom"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Story info & emblem */}
        <div className="flex items-center gap-3 w-full md:w-1/3 min-w-0">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0 bg-[#F9F8F6] border border-[#E8E5DF] overflow-hidden rounded-xs">
            <img
              src={activeAudioArticle.heroImage}
              alt={activeAudioArticle.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
              <BrandLogo variant="emblem" size={14} theme="dark" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono-editorial text-[#EA580C] uppercase tracking-wider font-semibold">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Listening to Story • {activeAudioArticle.category}</span>
            </div>
            <h4 className="font-serif-editorial text-sm sm:text-base font-bold truncate text-[#111110]">
              {activeAudioArticle.title}
            </h4>
            <span className="text-[11px] text-[#55524B] block truncate">
              Written by {activeAudioArticle.author.name} • {activeAudioArticle.audioMinutes || 5} min audio
            </span>
          </div>

          {/* Mobile Exit Button */}
          <button
            onClick={stopAudio}
            className="md:hidden shrink-0 flex items-center gap-1 text-xs font-mono-editorial text-[#6E6A62] hover:text-[#DC2626] bg-[#F5F4F0] hover:bg-[#FEE2E2] px-2.5 py-1.5 rounded transition-colors border border-[#E8E5DF]"
            title="Exit Listen Mode"
            aria-label="Exit audio listening mode"
          >
            <X className="w-4 h-4" />
            <span>Exit</span>
          </button>
        </div>

        {/* Player controls & scrubber */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-1/2">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => handleSeek(Math.max(0, audioProgress - 5))}
              className="p-1.5 text-[#55524B] hover:text-[#111110] hover:bg-[#F5F4F0] rounded transition-colors"
              title="Rewind 15 seconds"
              aria-label="Rewind 15 seconds"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={toggleAudioPlay}
              className="w-9 h-9 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-md"
              title={isPlayingAudio ? 'Pause Narration' : 'Play Narration'}
              aria-label={isPlayingAudio ? 'Pause Narration' : 'Play Narration'}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => handleSeek(Math.min(100, audioProgress + 5))}
              className="p-1.5 text-[#55524B] hover:text-[#111110] hover:bg-[#F5F4F0] rounded transition-colors"
              title="Skip forward 15 seconds"
              aria-label="Skip forward 15 seconds"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={handleSpeedToggle}
              className="text-[11px] font-mono-editorial font-bold bg-[#F5F4F0] border border-[#E8E5DF] hover:bg-[#EAE8E2] text-[#111110] px-2.5 py-1 rounded transition-colors"
              title="Change speech playback speed"
            >
              {audioSpeed}x
            </button>
          </div>

          {/* Scrubber track */}
          <div className="w-full flex items-center gap-2.5 text-[11px] font-mono-editorial text-[#6E6A62]">
            <span className="w-10 text-right tabular-nums text-[#111110] font-medium">{formatTime(currentSeconds)}</span>
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="0.25"
                value={audioProgress}
                onChange={(e) => handleSeek(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #EA580C ${Math.min(100, Math.max(0, audioProgress))}%, #E8E5DF ${Math.min(100, Math.max(0, audioProgress))}%)`,
                }}
                className="w-full appearance-none accent-[#EA580C] h-2 rounded-full cursor-pointer transition-all"
                aria-label="Audio progress seek slider"
              />
            </div>
            <span className="w-10 tabular-nums">{formatTime(totalSeconds)}</span>
          </div>
        </div>

        {/* Desktop Exit / Close Button */}
        <div className="hidden md:flex justify-end items-center gap-2 w-auto md:w-1/3 min-w-0">
          <button
            onClick={stopAudio}
            className="flex items-center gap-1.5 text-xs font-mono-editorial font-semibold text-[#55524B] hover:text-[#DC2626] bg-[#F5F4F0] hover:bg-[#FEE2E2] px-3.5 py-2 rounded-xs border border-[#E8E5DF] transition-all hover:border-[#FCA5A5]"
            title="Stop narration and exit audio mode"
            aria-label="Exit audio listening mode"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Listen Mode</span>
            <X className="w-3.5 h-3.5 ml-0.5 opacity-60" />
          </button>
        </div>
      </div>
    </aside>
  );
};
