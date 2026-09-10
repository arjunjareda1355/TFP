import { Article } from '../types';

export interface AudioEngineCallbacks {
  onProgress: (percent: number) => void;
  onEnd: () => void;
  onError: (error: any) => void;
  onStateChange: (isPlaying: boolean) => void;
}

class MagazineAudioEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private chunks: string[] = [];
  private currentChunkIndex = 0;
  private isPlaying = false;
  private isPaused = false;
  private speed = 1;
  private callbacks: AudioEngineCallbacks | null = null;
  private audioContext: AudioContext | null = null;
  private synthOscillator: OscillatorNode | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  
  // Progress tracking
  private progressTimer: any = null;
  private keepAliveTimer: any = null;
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
   * Cleans text and splits into pleasant, short speech chunks to avoid browser timeout bugs.
   */
  private prepareChunks(article: Article): string[] {
    const rawChunks: string[] = [];

    // Header intro chunk
    const categoryName = article.category || 'Dispatches';
    const authorName = typeof article.author === 'string' ? article.author : (article.author?.name || 'Staff Writer');
    const intro = `The Folded Page presents: ${article.title}. Dispatched in ${categoryName} by ${authorName}.`;
    rawChunks.push(intro);

    if (article.subtitle) {
      rawChunks.push(article.subtitle);
    } else if (article.deck) {
      rawChunks.push(article.deck);
    }

    // Article body content
    if (article.blocks && article.blocks.length > 0) {
      for (const block of article.blocks) {
        if (block.type === 'paragraph' && block.text) {
          rawChunks.push(block.text);
        } else if (block.type === 'subheading' && block.text) {
          rawChunks.push(`Section: ${block.text}`);
        } else if (block.type === 'pullquote' && block.text) {
          rawChunks.push(`Quote: "${block.text}"`);
        } else if (block.type === 'list' && block.items && block.items.length > 0) {
          rawChunks.push(block.items.join('. '));
        } else if (block.text) {
          rawChunks.push(block.text);
        }
      }
    } else if ((article as any).content) {
      const rawText = String((article as any).content);
      const paragraphs = rawText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      rawChunks.push(...paragraphs);
    }

    // Further split chunks longer than 180 characters to prevent browser speech cutoff
    const safeChunks: string[] = [];
    for (const chunk of rawChunks) {
      const clean = chunk
        .replace(/[*_#`~[\]()]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!clean) continue;

      if (clean.length <= 180) {
        safeChunks.push(clean);
      } else {
        const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [clean];
        for (const sentence of sentences) {
          const s = sentence.trim();
          if (s.length > 0) safeChunks.push(s);
        }
      }
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

      if (this.elapsedTimeSec >= this.totalDurationSec) {
        this.elapsedTimeSec = this.totalDurationSec;
        if (this.callbacks) {
          this.callbacks.onProgress(100);
        }
        if (this.currentChunkIndex >= this.chunks.length) {
          this.handlePlaybackComplete();
        }
        return;
      }

      const percent = Math.min(100, Math.max(0, (this.elapsedTimeSec / this.totalDurationSec) * 100));
      if (this.callbacks) {
        this.callbacks.onProgress(Number(percent.toFixed(1)));
      }
    }, intervalMs);
  }

  private stopProgressTimer() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  // Workaround for Chrome bug where SpeechSynthesis pauses silently after ~15s
  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (
        this.isPlaying &&
        !this.isPaused &&
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        window.speechSynthesis.speaking
      ) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private speakCurrentChunk() {
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
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      (window as any).__tfp_active_utterance = utterance;

      utterance.rate = Math.max(0.75, Math.min(2.0, this.speed));
      utterance.pitch = 1.0;

      const voice = this.getBestVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        if (!this.isPlaying || this.isPaused) return;
        this.currentChunkIndex++;
        if (this.currentChunkIndex < this.chunks.length) {
          this.speakCurrentChunk();
        } else {
          this.handlePlaybackComplete();
        }
      };

      utterance.onerror = (e) => {
        if (e.error === 'canceled' || e.error === 'interrupted') {
          return;
        }
        console.warn('Speech synthesis chunk notice:', e);
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
    (window as any).__tfp_active_utterance = null;

    this.stopProgressTimer();
    this.stopKeepAlive();

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

    this.stopProgressTimer();
    this.stopKeepAlive();

    if (this.callbacks) {
      this.callbacks.onProgress(100);
      this.callbacks.onStateChange(false);
      this.callbacks.onEnd();
    }
  }
}

export const magazineAudio = new MagazineAudioEngine();
