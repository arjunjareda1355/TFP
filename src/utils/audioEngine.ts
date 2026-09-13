import { Article } from '../types';

export interface AudioEngineCallbacks {
  onProgress: (percent: number) => void;
  onEnd: () => void;
  onError: (error: any) => void;
  onStateChange: (isPlaying: boolean) => void;
}

class MagazineAudioEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();
  private chunks: string[] = [];
  private currentChunkIndex = 0;
  private isPlaying = false;
  private isPaused = false;
  private speed = 1;
  private callbacks: AudioEngineCallbacks | null = null;
  private audioContext: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  
  // Progress & watchdog tracking
  private progressTimer: any = null;
  private keepAliveTimer: any = null;
  private chunkWatchdogTimer: any = null;
  private elapsedTimeSec = 0;
  private totalDurationSec = 300; // default 5 mins

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        this.loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => {
            this.loadVoices();
          };
        }
      } catch (e) {
        console.warn('SpeechSynthesis initialization notice:', e);
      }
    }
  }

  private loadVoices() {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.voices = window.speechSynthesis.getVoices() || [];
      }
    } catch (e) {
      console.warn('Error loading speech voices:', e);
    }
  }

  private getBestVoice(): SpeechSynthesisVoice | null {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    if (!this.voices || this.voices.length === 0) return null;

    // Prefer high quality natural English voices
    const preferred =
      this.voices.find(
        (v) =>
          (v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')) &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Enhanced') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Karen') ||
            v.name.includes('Serena'))
      ) ||
      this.voices.find((v) => v.lang.startsWith('en')) ||
      this.voices[0];

    return preferred || null;
  }

  /**
   * Unlocks and keeps the browser audio hardware pipeline active to prevent
   * mobile/desktop OS audio subsystems from suspending or muting speech synthesis.
   */
  private ensureAudioPipeline() {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext) {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }
      }
    } catch (e) {
      // Non-critical audio pipeline catch
    }
  }

  /**
   * Splits text into natural sentence and clause chunks strictly under maxLen (~100 chars).
   * Short chunks prevent Chrome's hardcoded ~15-second speech synthesis cutoff bug
   * while maintaining natural prosody and pleasant phrasing.
   */
  private splitIntoComfortableChunks(rawText: string, maxLen = 105): string[] {
    const clean = rawText
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return [];
    if (clean.length <= maxLen) return [clean];

    // 1. Split on sentence terminators: period, exclamation, question mark
    const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [clean];
    const results: string[] = [];

    for (const rawSentence of sentences) {
      const s = rawSentence.trim();
      if (!s) continue;
      if (s.length <= maxLen) {
        results.push(s);
        continue;
      }

      // 2. Sentence is longer than maxLen: split on natural clause punctuation (commas, semicolons, colons, em-dashes)
      const clauses = s.split(/([,;:—–\-"'\(\)]+)/);
      let currentClause = '';

      for (let i = 0; i < clauses.length; i++) {
        const part = clauses[i];
        if (!part) continue;

        if ((currentClause + part).length <= maxLen) {
          currentClause += part;
        } else {
          if (currentClause.trim()) {
            results.push(currentClause.trim());
          }
          if (part.length > maxLen) {
            // Unbroken phrase: split by words
            const words = part.split(/\s+/);
            let subRun = '';
            for (const word of words) {
              if ((subRun + ' ' + word).trim().length <= maxLen) {
                subRun = (subRun + ' ' + word).trim();
              } else {
                if (subRun.trim()) results.push(subRun.trim());
                subRun = word;
              }
            }
            if (subRun.trim()) results.push(subRun.trim());
            currentClause = '';
          } else {
            currentClause = part;
          }
        }
      }
      if (currentClause.trim()) {
        results.push(currentClause.trim());
      }
    }

    return results.filter((c) => c.length > 0);
  }

  /**
   * Cleans text and splits into pleasant, short speech chunks to prevent audio muting.
   */
  private prepareChunks(article: Article): string[] {
    const rawParagraphs: string[] = [];

    // Header intro chunk
    const categoryName = article.category || 'Dispatches';
    const authorName = typeof article.author === 'string' ? article.author : (article.author?.name || 'Staff Writer');
    const intro = `The Folded Page presents: ${article.title}. Dispatched in ${categoryName} by ${authorName}.`;
    rawParagraphs.push(intro);

    if (article.subtitle) {
      rawParagraphs.push(article.subtitle);
    } else if (article.deck) {
      rawParagraphs.push(article.deck);
    }

    // Article body content
    if (article.blocks && article.blocks.length > 0) {
      for (const block of article.blocks) {
        if (block.type === 'paragraph' && block.text) {
          rawParagraphs.push(block.text);
        } else if (block.type === 'subheading' && block.text) {
          rawParagraphs.push(`Section: ${block.text}`);
        } else if (block.type === 'pullquote' && block.text) {
          rawParagraphs.push(`Quote: "${block.text}"`);
        } else if (block.type === 'list' && block.items && block.items.length > 0) {
          rawParagraphs.push(block.items.join('. '));
        } else if (block.text) {
          rawParagraphs.push(block.text);
        }
      }
    } else if ((article as any).content) {
      const rawText = String((article as any).content);
      const paragraphs = rawText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      rawParagraphs.push(...paragraphs);
    }

    // Split all paragraphs into safe, comfortable speech chunks
    const safeChunks: string[] = [];
    for (const paragraph of rawParagraphs) {
      const chunkList = this.splitIntoComfortableChunks(paragraph, 105);
      safeChunks.push(...chunkList);
    }

    return safeChunks.length > 0 ? safeChunks : [article.title, article.subtitle || 'Article narration in progress.'];
  }

  public play(article: Article, callbacks: AudioEngineCallbacks, speed = 1) {
    this.stop();

    this.callbacks = callbacks;
    this.speed = speed;
    this.isPlaying = true;
    this.isPaused = false;
    this.chunks = this.prepareChunks(article);
    this.currentChunkIndex = 0;
    this.elapsedTimeSec = 0;

    // Calculate total duration in seconds from audioMinutes or word count
    const minutes = article.audioMinutes || Math.max(2, Math.ceil(this.chunks.join(' ').split(/\s+/).length / 140));
    this.totalDurationSec = Math.max(30, minutes * 60);

    this.ensureAudioPipeline();

    if (this.callbacks) {
      this.callbacks.onStateChange(true);
      this.callbacks.onProgress(0);
    }

    this.startProgressTimer();
    this.startKeepAlive();
    this.speakCurrentChunk();
  }

  private startProgressTimer() {
    this.stopProgressTimer();
    const intervalMs = 250;
    this.progressTimer = setInterval(() => {
      if (!this.isPlaying || this.isPaused) return;

      this.elapsedTimeSec += (intervalMs / 1000) * this.speed;

      // Calculate progress from elapsed time and chunk completion
      const timePercent = (this.elapsedTimeSec / this.totalDurationSec) * 100;
      const chunkPercent = this.chunks.length > 0 ? (this.currentChunkIndex / this.chunks.length) * 100 : 0;
      // Weighted blend for smooth tracking
      const blendedPercent = Math.min(100, Math.max(0, Math.max(timePercent * 0.4 + chunkPercent * 0.6, chunkPercent)));

      if (this.elapsedTimeSec >= this.totalDurationSec && this.currentChunkIndex >= this.chunks.length) {
        this.handlePlaybackComplete();
        return;
      }

      if (this.callbacks) {
        this.callbacks.onProgress(Number(blendedPercent.toFixed(1)));
      }
    }, intervalMs);
  }

  private stopProgressTimer() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  /**
   * Safe Keep-Alive watchdog:
   * Rather than calling pause() and resume() (which breaks audio renderer buffers in Chrome),
   * this only detects if the browser's speech synthesis was unexpectedly paused or muted
   * and gently resumes it.
   */
  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (this.isPlaying && !this.isPaused) {
        // If synthesis engine entered paused state on its own, resume it
        if (window.speechSynthesis.paused) {
          try {
            window.speechSynthesis.resume();
          } catch (e) {
            console.warn('Keep-alive resume notice:', e);
          }
        }
      }
    }, 4000);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    this.stopChunkWatchdog();
  }

  private stopChunkWatchdog() {
    if (this.chunkWatchdogTimer) {
      clearTimeout(this.chunkWatchdogTimer);
      this.chunkWatchdogTimer = null;
    }
  }

  private speakCurrentChunk() {
    this.stopChunkWatchdog();

    if (!this.isPlaying || this.isPaused) return;

    if (this.currentChunkIndex >= this.chunks.length) {
      this.handlePlaybackComplete();
      return;
    }

    const text = this.chunks[this.currentChunkIndex];

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      this.ensureAudioPipeline();

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Cancel previous speech without clearing queue violently
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // CRITICAL: Retain strong reference on Set to permanently prevent V8 garbage collection
      this.activeUtterances.add(utterance);
      (window as any).__tfp_speech_utterances = this.activeUtterances;

      utterance.rate = Math.max(0.75, Math.min(2.0, this.speed));
      utterance.pitch = 1.0;

      const voice = this.getBestVoice();
      if (voice) {
        utterance.voice = voice;
      }

      const chunkIndexWhenStarted = this.currentChunkIndex;

      // Intelligent Chunk Watchdog:
      // If a chunk gets silent or fails to fire onend past its expected duration + safety buffer,
      // the watchdog auto-recovers and seamlessly advances to the next chunk!
      const estimatedSec = Math.max(3, Math.ceil((text.length / 10) / this.speed)) + 3;
      this.chunkWatchdogTimer = setTimeout(() => {
        if (this.isPlaying && !this.isPaused && this.currentChunkIndex === chunkIndexWhenStarted) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          } else {
            // Auto-advance to next chunk to recover from silent browser stall
            this.activeUtterances.delete(utterance);
            this.currentChunkIndex++;
            this.speakCurrentChunk();
          }
        }
      }, estimatedSec * 1000);

      utterance.onend = () => {
        this.stopChunkWatchdog();
        this.activeUtterances.delete(utterance);

        if (!this.isPlaying || this.isPaused) return;
        this.currentChunkIndex++;
        if (this.currentChunkIndex < this.chunks.length) {
          this.speakCurrentChunk();
        } else {
          this.handlePlaybackComplete();
        }
      };

      utterance.onerror = (e) => {
        this.stopChunkWatchdog();
        this.activeUtterances.delete(utterance);

        if (e.error === 'canceled' || e.error === 'interrupted') {
          return;
        }
        console.warn('Speech synthesis chunk notice:', e);
        if (!this.isPlaying || this.isPaused) return;

        this.currentChunkIndex++;
        if (this.currentChunkIndex < this.chunks.length) {
          this.speakCurrentChunk();
        } else {
          this.handlePlaybackComplete();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
    }
  }

  public pause() {
    this.isPaused = true;
    this.isPlaying = false;
    this.stopProgressTimer();
    this.stopKeepAlive();
    this.stopChunkWatchdog();

    if (this.callbacks) {
      this.callbacks.onStateChange(false);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch (e) {
        console.warn('Speech pause error:', e);
      }
    }
  }

  public resume() {
    this.isPaused = false;
    this.isPlaying = true;
    this.ensureAudioPipeline();

    if (this.callbacks) {
      this.callbacks.onStateChange(true);
    }
    this.startProgressTimer();
    this.startKeepAlive();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          this.speakCurrentChunk();
        }
      } catch (e) {
        console.warn('Speech resume error:', e);
        this.speakCurrentChunk();
      }
    } else {
      this.speakCurrentChunk();
    }
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public seek(percent: number) {
    const targetPercent = Math.max(0, Math.min(100, percent));
    this.elapsedTimeSec = (targetPercent / 100) * this.totalDurationSec;
    
    // Position chunk index proportionally
    if (this.chunks.length > 0) {
      this.currentChunkIndex = Math.min(
        this.chunks.length - 1,
        Math.floor((targetPercent / 100) * this.chunks.length)
      );
    }

    if (this.callbacks) {
      this.callbacks.onProgress(targetPercent);
    }

    if (this.isPlaying && !this.isPaused) {
      this.speakCurrentChunk();
    }
  }

  public setSpeed(speed: number) {
    this.speed = speed;
    if (this.isPlaying && !this.isPaused) {
      this.speakCurrentChunk();
    }
  }

  public stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentChunkIndex = 0;
    this.elapsedTimeSec = 0;
    this.currentUtterance = null;
    this.activeUtterances.clear();
    if (typeof window !== 'undefined') {
      (window as any).__tfp_speech_utterances = null;
    }

    this.stopProgressTimer();
    this.stopKeepAlive();
    this.stopChunkWatchdog();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Speech cancel error:', e);
      }
    }

    if (this.callbacks) {
      this.callbacks.onStateChange(false);
      this.callbacks.onProgress(0);
    }
  }

  private handlePlaybackComplete() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentChunkIndex = 0;
    this.elapsedTimeSec = this.totalDurationSec;
    this.activeUtterances.clear();

    this.stopProgressTimer();
    this.stopKeepAlive();
    this.stopChunkWatchdog();

    if (this.callbacks) {
      this.callbacks.onProgress(100);
      this.callbacks.onStateChange(false);
      this.callbacks.onEnd();
    }
  }
}

export const magazineAudio = new MagazineAudioEngine();

