/**
 * Arabic and multilingual search normalization utilities.
 * IMPORTANT: Normalization is used ONLY for temporary search index matching.
 * The original Quranic text is NEVER modified or altered for display.
 */

// Arabic diacritical marks and Quranic annotation symbols (Unicode ranges)
const HARAKAT_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0610-\u061A\u08F0-\u08FF]/g;

// Tatweel (kashida)
const TATWEEL_REGEX = /\u0640/g;

/**
 * Normalizes an Arabic string for matching purposes only.
 */
export function normalizeArabicForSearch(text: string): string {
  if (!text) return '';
  return text
    // Remove all harakat / tashkeel / pause signs / Quranic recitation marks (including \u0670 dagger alif)
    .replace(HARAKAT_REGEX, '')
    // Remove tatweel
    .replace(TATWEEL_REGEX, '')
    // Normalize forms of Alef (أ, إ, آ, ٱ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Alif Maqsura (ى -> ي)
    .replace(/ى/g, 'ي')
    // Normalize Taa Marbuta (ة -> ه)
    .replace(/ة/g, 'ه')
    // Normalize Arabic Waw with Hamza (ؤ -> و)
    .replace(/ؤ/g, 'و')
    // Normalize Ya with Hamza (ئ -> ي)
    .replace(/ئ/g, 'ي')
    // Trim and normalize whitespace
    .trim()
    .toLowerCase();
}

/**
 * Normalizes Urdu text for search matching.
 */
export function normalizeUrduForSearch(text: string): string {
  if (!text) return '';
  return text
    .replace(HARAKAT_REGEX, '')
    .replace(TATWEEL_REGEX, '')
    .replace(/[يے]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ہ')
    .replace(/ه/g, 'ہ')
    .trim()
    .toLowerCase();
}

/**
 * Normalizes English text for search matching.
 */
export function normalizeEnglishForSearch(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse an Ayah reference query like "2:255", "surah 2 ayah 255", "2 255"
 */
export function parseAyahReference(query: string): { surahId: number; ayahNumber: number } | null {
  const clean = query.trim().toLowerCase();
  
  // Format 1: "2:255" or "02:255"
  const colonMatch = clean.match(/^(\d{1,3}):(\d{1,3})$/);
  if (colonMatch) {
    const s = parseInt(colonMatch[1], 10);
    const a = parseInt(colonMatch[2], 10);
    if (s >= 1 && s <= 114 && a >= 1) return { surahId: s, ayahNumber: a };
  }

  // Format 2: "surah 2 ayah 255" or "sura 2 aya 255" or "s2 a255"
  const wordMatch = clean.match(/(?:surah|sura|s)\s*(\d{1,3})\s*(?:ayah|aya|verse|v|a)?\s*(\d{1,3})/);
  if (wordMatch) {
    const s = parseInt(wordMatch[1], 10);
    const a = parseInt(wordMatch[2], 10);
    if (s >= 1 && s <= 114 && a >= 1) return { surahId: s, ayahNumber: a };
  }

  // Format 3: "2 255"
  const spaceMatch = clean.match(/^(\d{1,3})\s+(\d{1,3})$/);
  if (spaceMatch) {
    const s = parseInt(spaceMatch[1], 10);
    const a = parseInt(spaceMatch[2], 10);
    if (s >= 1 && s <= 114 && a >= 1) return { surahId: s, ayahNumber: a };
  }

  return null;
}
