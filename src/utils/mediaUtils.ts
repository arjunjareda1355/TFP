/**
 * Media & Video URL Parser & Normalizer for The Folded Page
 * Handles all video links (Instagram, Google Drive, Google Photos, YouTube, Vimeo, TikTok, direct MP4, iframes, etc.)
 * and image links (Google Drive, Google Photos, Dropbox, Imgur, Unsplash, Data URLs, uploads).
 */

export interface ParsedVideo {
  type:
    | 'youtube'
    | 'vimeo'
    | 'instagram'
    | 'googledrive'
    | 'googlephotos'
    | 'tiktok'
    | 'dailymotion'
    | 'loom'
    | 'direct'
    | 'iframe'
    | 'custom';
  embedUrl: string;
  directUrl?: string;
  aspectRatio: '16/9' | '9/16' | '4/3' | '1/1';
  platformName: string;
  isDirectVideo: boolean;
  isIframeSnippet: boolean;
  originalInput: string;
}

/**
 * Normalizes any image URL (Google Drive, Google Photos, Dropbox, Imgur, Unsplash, etc.)
 * to ensure it loads directly in standard <img> tags.
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs, Blobs, and local uploads can be used directly
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/uploads/') ||
    trimmed.startsWith('/assets/')
  ) {
    return trimmed;
  }

  // 1. Google Drive Image
  // Match: https://drive.google.com/file/d/FILE_ID/view...
  // Match: https://drive.google.com/open?id=FILE_ID
  // Match: https://drive.google.com/uc?id=FILE_ID
  const gDriveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gDriveFileMatch && gDriveFileMatch[1]) {
    const fileId = gDriveFileMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  const gDriveIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]+)/);
  if (gDriveIdMatch && gDriveIdMatch[1]) {
    const fileId = gDriveIdMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 2. Google Photos Direct CDN (lh3.googleusercontent.com)
  if (trimmed.includes('googleusercontent.com') && !trimmed.includes('=') && !trimmed.includes('/d/')) {
    return `${trimmed}=w2400-no`;
  }

  // 3. Dropbox Direct Download / View
  // https://www.dropbox.com/s/xyz/photo.jpg?dl=0 -> raw=1
  if (trimmed.includes('dropbox.com')) {
    if (trimmed.includes('dl=0')) {
      return trimmed.replace('dl=0', 'raw=1');
    }
    if (!trimmed.includes('raw=1') && !trimmed.includes('dl=1')) {
      const sep = trimmed.includes('?') ? '&' : '?';
      return `${trimmed}${sep}raw=1`;
    }
  }

  // 4. Imgur Direct Image
  // https://imgur.com/aBcDeFg -> https://i.imgur.com/aBcDeFg.jpg
  const imgurMatch = trimmed.match(/imgur\.com\/([a-zA-Z0-9]+)(?:\.[a-zA-Z]+)?$/);
  if (imgurMatch && imgurMatch[1] && !trimmed.includes('i.imgur.com') && !trimmed.includes('/a/')) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
  }

  // 5. Unsplash image optimization helper
  if (trimmed.includes('images.unsplash.com') && !trimmed.includes('auto=format')) {
    const sep = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${sep}auto=format&fit=crop&q=85`;
  }

  // 6. Instagram Posts / Reels / Photos to Direct Image Media
  // Matches: instagram.com/p/CODE, instagram.com/reel/CODE, instagram.com/tv/CODE, instagr.am/p/CODE
  const igImageMatch = trimmed.match(/(?:instagram\.com|instagr\.am)\/(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/i);
  if (igImageMatch && igImageMatch[1]) {
    const code = igImageMatch[1];
    return `https://www.instagram.com/p/${code}/media/?size=l`;
  }

  return trimmed;
}

/**
 * Parses any video input (URL, iframe code, share link, social link)
 * and returns structured embed and platform metadata.
 */
export function parseVideoUrl(input: string | undefined | null): ParsedVideo | null {
  if (!input || typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;

  // Check if input is a raw <iframe> snippet
  if (raw.toLowerCase().includes('<iframe') && raw.toLowerCase().includes('src=')) {
    const srcMatch = raw.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      const extractedSrc = srcMatch[1];
      // Recursive parse of extracted src
      const inner = parseVideoUrl(extractedSrc);
      if (inner) {
        return {
          ...inner,
          isIframeSnippet: true,
          originalInput: raw,
        };
      }
      return {
        type: 'iframe',
        embedUrl: extractedSrc,
        aspectRatio: '16/9',
        platformName: 'Embedded Iframe',
        isDirectVideo: false,
        isIframeSnippet: true,
        originalInput: raw,
      };
    }
  }

  // 1. YouTube
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID, youtube.com/live/ID
  const ytShortsMatch = raw.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
  if (ytShortsMatch && ytShortsMatch[1]) {
    const id = ytShortsMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
      aspectRatio: '9/16',
      platformName: 'YouTube Shorts',
      isDirectVideo: false,
      isIframeSnippet: false,
      originalInput: raw,
    };
  }

  const ytStandardMatch =
    raw.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/i);
  if (ytStandardMatch && ytStandardMatch[1]) {
    const id = ytStandardMatch[1];
    // Extract timestamp if present (?t=120 or &t=2m10s)
    let startParam = '';
    const timeMatch = raw.match(/[?&]t=([0-9a-z]+)/i);
    if (timeMatch && timeMatch[1]) {
      let seconds = 0;
      const tVal = timeMatch[1];
      if (/^\d+$/.test(tVal)) {
        seconds = parseInt(tVal, 10);
      } else {
        const m = tVal.match(/(\d+)m/);
        const s = tVal.match(/(\d+)s/);
        if (m) seconds += parseInt(m[1], 10) * 60;
        if (s) seconds += parseInt(s[1], 10);
      }
      if (seconds > 0) startParam = `&start=${seconds}`;
    }

    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1${startParam}`,
      aspectRatio: '16/9',
      platformName: 'YouTube',
      isDirectVideo: false,
      isIframeSnippet: false,
      originalInput: raw,
    };
  }

  // 2. Instagram Reels & Posts
  // Matches: instagram.com/reel/CODE, instagram.com/reels/CODE, instagram.com/p/CODE, instagram.com/tv/CODE
  const igMatch = raw.match(/(?:instagram\.com|instagr\.am)\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i);
  if (igMatch && igMatch[1]) {
    const code = igMatch[1];
    const isReel = raw.toLowerCase().includes('/reel');
    return {
      type: 'instagram',
      embedUrl: `https://www.instagram.com/p/${code}/embed/captioned/`,
      aspectRatio: isReel ? '9/16' : '1/1',
      platformName: isReel ? 'Instagram Reel' : 'Instagram Post',
      isDirectVideo: false,
      isIframeSnippet: false,
      originalInput: raw,
    };
  }

  // 3. Google Drive Video
  // Matches: drive.google.com/file/d/FILE_ID/view..., drive.google.com/open?id=FILE_ID, drive.google.com/file/d/FILE_ID/preview
  const gDriveMatch =
    raw.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
    raw.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    return {
      type: 'googledrive',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      aspectRatio: '16/9',
      platformName: 'Google Drive Video',
      isDirectVideo: false,
      isIframeSnippet: false,
      originalInput: raw,
    };
  }

  // 4. Google Photos (Shared album / video link)
  if (raw.includes('photos.google.com') || raw.includes('photos.app.goo.gl')) {
    return {
      type: 'googlephotos',
      embedUrl: raw,
      aspectRatio: '16/9',
      platformName: 'Google Photos Video',
      isDirectVideo: false,
      isIframeSnippet: false,
      originalInput: raw,
    };
  }

  // 5. Vimeo
  // Matches: vimeo.com/123456789, player.vimeo.com/video/123456789
  const vimeoMatch = raw.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`,
      aspectRatio: '16/9',
      platformName: 'Vimeo',
      isDirectVideo: false,
      isIframeSnippet: false,
      originalInput: raw,
    };
  }

  // 6. TikTok
  // Matches: tiktok.com/@user/video/1234567890
  const tiktokMatch = raw.match(/tiktok\.com\/@[^/]+\/video\/([0-9]+)/i);
  if (tiktokMatch && tiktokMatch[1]) {
    const id = tiktokMatch[1];
    return {
      type: 'tiktok',
      embedUrl: `https://www.tiktok.com/embed/v2/${id}`,
      aspectRatio: '9/16',
      platformName: 'TikTok',
      isDirectVideo: false,
      isIframeSnippet: false,
      originalInput: raw,
    };
  }

  // 7. Dailymotion
  const dailyMatch = raw.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/i);
  if (dailyMatch && dailyMatch[1]) {
    const id = dailyMatch[1];
    return {
      type: 'dailymotion',
      embedUrl: `https://www.dailymotion.com/embed/video/${id}`,
      aspectRatio: '16/9',
      platformName: 'Dailymotion',
      isDirectVideo: false,
      isIframeSnippet: false,
      originalInput: raw,
    };
  }

  // 8. Loom
  const loomMatch = raw.match(/loom\.com\/share\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    const id = loomMatch[1];
    return {
      type: 'loom',
      embedUrl: `https://www.loom.com/embed/${id}`,
      aspectRatio: '16/9',
      platformName: 'Loom',
      isDirectVideo: false,
      isIframeSnippet: false,
      originalInput: raw,
    };
  }

  // 9. Direct Video Files (.mp4, .webm, .ogg, .mov, .m4v, blob:, /uploads/...)
  const isDirectVideoExt = /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(raw);
  const isVideoBlob = raw.startsWith('blob:') || raw.startsWith('data:video/');
  if (isDirectVideoExt || isVideoBlob) {
    return {
      type: 'direct',
      embedUrl: raw,
      directUrl: raw,
      aspectRatio: '16/9',
      platformName: 'HTML5 Video Stream',
      isDirectVideo: true,
      isIframeSnippet: false,
      originalInput: raw,
    };
  }

  // 10. Fallback / Custom Link
  // If it's an HTTP/HTTPS URL, treat as custom embeddable link
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('//')) {
    return {
      type: 'custom',
      embedUrl: raw,
      aspectRatio: '16/9',
      platformName: 'Web Video Stream',
      isDirectVideo: false,
      isIframeSnippet: false,
      originalInput: raw,
    };
  }

  return null;
}

/**
 * Helper to get user-friendly platform title from any video input.
 */
export function detectVideoPlatform(urlOrEmbed: string | undefined | null): string {
  if (!urlOrEmbed) return 'Video';
  const parsed = parseVideoUrl(urlOrEmbed);
  return parsed?.platformName || 'Video Embed';
}

/**
 * Converts a browser File object to a Base64 data URL string for resilient offline preview / fallback.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
