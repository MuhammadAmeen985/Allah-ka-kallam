export interface SurahMeta {
  id: number;
  nameArabic: string;
  nameTransliteration: string;
  nameEnglish: string;
  ayahCount: number;
  revelationType: 'Meccan' | 'Medinan';
  revelationOrder: number;
  rukus: number;
  startAyahGlobal: number;
}

export interface TranslationItem {
  text: string;
  translator: string;
  source: string;
}

export interface Verse {
  ayah: number;
  arabic: string;
  translations: {
    en: TranslationItem;
    ur: TranslationItem;
  };
}

export interface SurahDetail extends SurahMeta {
  verses: Verse[];
}

export interface Bookmark {
  id: string; // e.g. "surah-2-ayah-255"
  surahId: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  ayahNumber: number;
  timestamp: number;
  arabicSnippet: string;
  englishSnippet?: string;
}

export interface LastReadPosition {
  surahId: number;
  ayahNumber: number;
  surahNameEnglish: string;
  surahNameArabic: string;
  timestamp: number;
}

export interface ReadingPreferences {
  theme: 'light' | 'sepia' | 'dark';
  arabicFontSize: number; // in px, e.g. 26 to 42
  translationFontSize: number; // in px, e.g. 14 to 22
  showArabic: boolean;
  showEnglish: boolean;
  showUrdu: boolean;
  readerMode: 'cards' | 'continuous';
  arabicFontFamily: 'amiri' | 'scheherazade' | 'noto';
}

export interface SearchResultItem {
  surahId: number;
  ayahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  surahNameTransliteration: string;
  arabicText: string;
  englishText: string;
  urduText: string;
  matchType: 'surah' | 'reference' | 'arabic' | 'english' | 'urdu';
  matchedSnippet: string;
}

export interface DatasetManifest {
  source: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  retrievalDate: string;
  arabicEdition: string;
  translations: {
    lang: string;
    name: string;
    translator: string;
    edition: string;
    source: string;
    license: string;
  }[];
  totalSurahs: number;
  totalAyahs: number;
  attributionNotice: string;
}
