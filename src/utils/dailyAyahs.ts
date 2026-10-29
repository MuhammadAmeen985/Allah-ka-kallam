import { fetchSurahDetail } from './quranApi';
import { Verse, SurahMeta } from '../types/quran';

export interface DailyAyahItem {
  surahId: number;
  ayahNumber: number;
  verse: Verse;
  surahMeta: {
    nameArabic: string;
    nameEnglish: string;
    nameTransliteration: string;
  };
}

// Curated verified verse coordinates (Surah ID : Ayah ID)
export const CURATED_DAILY_VERSES = [
  { surah: 2, ayah: 255 },  // Ayat al-Kursi
  { surah: 2, ayah: 286 },  // End of Baqarah
  { surah: 13, ayah: 28 },  // Hearts assured by remembrance
  { surah: 39, ayah: 53 },  // Mercy of Allah
  { surah: 94, ayah: 5 },   // With hardship ease
  { surah: 93, ayah: 3 },   // Your Lord has not forsaken you
  { surah: 25, ayah: 63 },  // Servants of the Most Merciful
  { surah: 3, ayah: 134 },  // Restraining anger and pardoning
  { surah: 2, ayah: 186 },  // Indeed I am near
  { surah: 49, ayah: 13 },  // Mankind created into nations to know one another
  { surah: 65, ayah: 3 },   // Allah provides from unexpected sources
  { surah: 112, ayah: 1 },  // Surah Al-Ikhlas
];

export async function getDailyAyah(overrideIndex?: number): Promise<DailyAyahItem | null> {
  try {
    // Deterministic selection based on day of year, or custom index
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const index = overrideIndex !== undefined 
      ? Math.abs(overrideIndex) % CURATED_DAILY_VERSES.length
      : dayOfYear % CURATED_DAILY_VERSES.length;

    const { surah, ayah } = CURATED_DAILY_VERSES[index];
    const surahData = await fetchSurahDetail(surah);
    const targetVerse = surahData.verses.find(v => v.ayah === ayah);

    if (!targetVerse) return null;

    return {
      surahId: surah,
      ayahNumber: ayah,
      verse: targetVerse,
      surahMeta: {
        nameArabic: surahData.nameArabic,
        nameEnglish: surahData.nameEnglish,
        nameTransliteration: surahData.nameTransliteration
      }
    };
  } catch (err) {
    console.error('Error loading daily ayah:', err);
    return null;
  }
}
