/**
 * SEO & Social Metadata Utility
 * Conforms with applet-seo skill and search engine indexing standards.
 * Dynamically manages <title>, meta description, canonical URLs,
 * OpenGraph, Twitter cards, and Schema.org structured data (JSON-LD).
 */

export interface SeoConfig {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  ogImageAlt?: string;
  authorName?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  structuredData?: object;
}

const DEFAULT_ORIGIN = 'https://foldedpage.in';
const DEFAULT_TITLE = "The Folded Page – What's Worth Knowing | Digital Editorial Magazine";
const DEFAULT_DESC =
  'A modern digital editorial magazine discovering noteworthy stories, cultural perspectives, human curiosities, and timeless insights from around the world. What\'s worth knowing.';
const DEFAULT_IMAGE = `${DEFAULT_ORIGIN}/logo.svg`;

function setMetaTag(selector: string, attrName: 'content', value: string) {
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    if (selector.startsWith('meta[name=')) {
      const name = selector.match(/name="([^"]+)"/)?.[1];
      if (name) element.setAttribute('name', name);
    } else if (selector.startsWith('meta[property=')) {
      const prop = selector.match(/property="([^"]+)"/)?.[1];
      if (prop) element.setAttribute('property', prop);
    }
    document.head.appendChild(element);
  }
  element.setAttribute(attrName, value);
}

function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setStructuredData(data?: object) {
  const SCRIPT_ID = 'dynamic-seo-ldjson';
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (!data) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

export function updatePageSeo(config: SeoConfig) {
  if (typeof document === 'undefined') return;

  const origin =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : DEFAULT_ORIGIN;

  const title = config.title ? `${config.title} — The Folded Page` : DEFAULT_TITLE;
  const description = config.description || DEFAULT_DESC;
  const canonicalUrl = config.canonicalPath
    ? `${origin}${config.canonicalPath.startsWith('/') ? config.canonicalPath : `/${config.canonicalPath}`}`
    : typeof window !== 'undefined'
    ? `${origin}${window.location.pathname}`
    : DEFAULT_ORIGIN;

  const image = config.ogImage
    ? config.ogImage.startsWith('http')
      ? config.ogImage
      : `${origin}${config.ogImage.startsWith('/') ? config.ogImage : `/${config.ogImage}`}`
    : DEFAULT_IMAGE;

  // 1. Page Title
  document.title = title;

  // 2. Canonical URL
  setCanonical(canonicalUrl);

  // 3. Meta Description
  setMetaTag('meta[name="description"]', 'content', description);

  // 4. Search Engine Robots & Crawlers (Allow all, index, follow)
  setMetaTag(
    'meta[name="robots"]',
    'content',
    'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
  );
  setMetaTag(
    'meta[name="googlebot"]',
    'content',
    'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
  );

  // 5. OpenGraph Tags
  setMetaTag('meta[property="og:title"]', 'content', title);
  setMetaTag('meta[property="og:description"]', 'content', description);
  setMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
  setMetaTag('meta[property="og:type"]', 'content', config.ogType || 'website');
  setMetaTag('meta[property="og:image"]', 'content', image);
  if (config.ogImageAlt) {
    setMetaTag('meta[property="og:image:alt"]', 'content', config.ogImageAlt);
  }

  // 6. Twitter Card Tags
  setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'content', title);
  setMetaTag('meta[name="twitter:description"]', 'content', description);
  setMetaTag('meta[name="twitter:image"]', 'content', image);

  // 7. Dynamic Schema.org JSON-LD
  setStructuredData(config.structuredData);
}

export function resetToDefaultSeo() {
  updatePageSeo({
    title: undefined,
    description: DEFAULT_DESC,
    canonicalPath: '/',
    ogType: 'website',
  });
}
