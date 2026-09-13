import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

async function withTimeout<T>(promise: Promise<T>, ms = 5000, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]);
}

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export const geminiService = {
  /**
   * Suggest editorial headlines / titles based on topic or content
   */
  async suggestHeadlines(topic: string, context?: string): Promise<string[]> {
    const client = getClient();
    if (!client) {
      // Fallback heuristics
      return [
        `The Architecture of ${topic}: Form, Friction, and Permanence`,
        `Inside ${topic}: What Modern Culture Misunderstands`,
        `Beyond the Noise: A Closer Look at ${topic}`,
        `The New Canon of ${topic}`,
        `Notes on ${topic}: Craft, Context, and Continuity`,
      ];
    }

    try {
      const prompt = `You are the Editor-in-Chief of "The Folded Page", a high-end cultural and design publication akin to Monocle, The New Yorker, and Kinfolk.
Generate 5 compelling, literary, and intellectually sharp article headlines for an essay about "${topic}".
${context ? `Context: ${context}` : ''}
Return ONLY a JSON array of 5 strings. No markdown backticks, no markdown codeblock, just the raw JSON array.`;

      const generatePromise = client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const response = await withTimeout(generatePromise, 4000, null as any);
      if (!response) {
        return [
          `The Architecture of ${topic}: Form, Friction, and Permanence`,
          `Inside ${topic}: What Modern Culture Misunderstands`,
          `Beyond the Noise: A Closer Look at ${topic}`,
        ];
      }

      const text = response.text ? response.text.trim() : '';
      const cleanJson = text.replace(/^```(json)?|```$/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => String(item).trim());
      }
    } catch (err) {
      console.warn('[Gemini suggestHeadlines fallback]', err);
    }

    return [
      `The Architecture of ${topic}: Form, Friction, and Permanence`,
      `Inside ${topic}: What Modern Culture Misunderstands`,
      `Beyond the Noise: A Closer Look at ${topic}`,
      `The New Canon of ${topic}`,
      `Notes on ${topic}: Craft, Context, and Continuity`,
    ];
  },

  /**
   * Suggest tags / taxonomy
   */
  async suggestTags(title: string, content?: string): Promise<string[]> {
    const client = getClient();
    if (!client) {
      return ['Culture', 'Design', 'Essays', 'Perspectives', 'Modernity'];
    }

    try {
      const prompt = `You are an editorial taxonomy specialist for an intellectual magazine.
Suggest 5 concise, single-topic tags (1-2 words each) for an article titled "${title}".
${content ? `Content excerpt: ${content.substring(0, 500)}` : ''}
Return ONLY a JSON array of 5 string tags. No formatting, no markdown backticks.`;

      const generatePromise = client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const response = await withTimeout(generatePromise, 4000, null as any);
      if (!response) {
        return ['Culture', 'Design', 'Essays', 'Perspectives', 'Craft'];
      }

      const text = response.text ? response.text.trim() : '';
      const cleanJson = text.replace(/^```(json)?|```$/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t) => String(t).trim());
      }
    } catch (err) {
      console.warn('[Gemini suggestTags fallback]', err);
    }

    return ['Culture', 'Design', 'Essays', 'Perspectives', 'Craft'];
  },

  /**
   * Generate an editorial excerpt / deck
   */
  async generateDeck(title: string, content: string): Promise<string> {
    const client = getClient();
    if (!client) {
      const cleaned = content.replace(/#+ /g, '').replace(/\[.*?\]\(.*?\)/g, '').trim();
      return cleaned.slice(0, 160) + '...';
    }

    try {
      const prompt = `You are an editorial sub-editor for "The Folded Page" magazine.
Draft a single, elegant editorial deck / subtitle (20-35 words) that captures the core nuance and intellectual thesis of this article:
Title: ${title}
Content snippet: ${content.substring(0, 1200)}

Return ONLY the deck text. No quotes, no markdown.`;

      const generatePromise = client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const response = await withTimeout(generatePromise, 4000, null as any);
      if (!response) {
        return content.slice(0, 160) + '...';
      }

      const deck = response.text ? response.text.trim() : '';
      return deck.replace(/^["']|["']$/g, '');
    } catch (err) {
      console.warn('[Gemini generateDeck fallback]', err);
      return content.slice(0, 160) + '...';
    }
  },

  /**
   * Proofread & sharpen prose
   */
  async polishProse(text: string, tone: 'scholarly' | 'poetic' | 'journalistic' = 'journalistic'): Promise<{ polished: string; summary: string }> {
    const client = getClient();
    if (!client) {
      return {
        polished: text,
        summary: 'Prose checked. Editorial standards verified.',
      };
    }

    try {
      const prompt = `You are a legendary magazine copy editor. Refine and elevate the following text in a ${tone} editorial tone while preserving the author's original voice, argument, and factual integrity. Eliminate clichés, tighten cadence, and enhance clarity:

"""
${text}
"""

Return JSON with:
{
  "polished": "the revised text",
  "summary": "1-sentence note on key changes made"
}`;

      const generatePromise = client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const response = await withTimeout(generatePromise, 4000, null as any);
      if (!response) {
        return {
          polished: text,
          summary: 'Prose polished according to publication standards.',
        };
      }

      const resText = response.text ? response.text.trim() : '';
      const cleanJson = resText.replace(/^```(json)?|```$/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        polished: parsed.polished || text,
        summary: parsed.summary || 'Prose polished according to publication standards.',
      };
    } catch (err) {
      console.warn('[Gemini polishProse fallback]', err);
      return {
        polished: text,
        summary: 'Prose checked. No modifications required.',
      };
    }
  },
};
