import React, { useState } from 'react';
import { BookOpen, Copy, Check, RefreshCw } from 'lucide-react';
import { DailyAyahItem, CURATED_DAILY_VERSES } from '../utils/dailyAyahs';

interface DailyAyahCardProps {
  dailyAyah: DailyAyahItem | null;
  loading: boolean;
  onRefresh: () => void;
  onNavigateToVerse: (surahId: number, ayahNumber: number) => void;
  onCopySuccess: (text: string) => void;
}

export const DailyAyahCard: React.FC<DailyAyahCardProps> = ({
  dailyAyah,
  loading,
  onRefresh,
  onNavigateToVerse,
  onCopySuccess,
}) => {
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="bg-stone-100/60 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl p-8 animate-pulse text-center">
        <p className="text-sm text-stone-500">Loading daily verse from verified Tanzil edition...</p>
      </div>
    );
  }

  if (!dailyAyah) return null;

  const { surahId, ayahNumber, verse, surahMeta } = dailyAyah;

  const handleCopy = () => {
    const textToCopy = `${verse.arabic}\n\n"${verse.translations.en.text}"\n— Surah ${surahMeta.nameEnglish} (${surahMeta.nameArabic}) [${surahId}:${ayahNumber}]\nTranslation: Saheeh International | Urdu: Fateh Muhammad Jalandhry\nSource: Tanzil Project (tanzil.net)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    onCopySuccess(`Copied Surah ${surahMeta.nameEnglish} ${surahId}:${ayahNumber} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section 
      aria-label="Daily Quran Verse" 
      className="relative bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-xs overflow-hidden transition-colors"
    >
      {/* Subtle curatorial background motif */}
      <div 
        aria-hidden="true" 
        className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/5 dark:bg-emerald-400/5 blur-2xl pointer-events-none" 
      />

      {/* Header with verified reference */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800/80 pb-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-sans text-emerald-800 dark:text-emerald-400 font-semibold">
            Ayah of the Day · آية اليوم
          </span>
          <h3 className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100 mt-0.5">
            Surah {surahMeta.nameEnglish} ({surahMeta.nameTransliteration}) · {surahMeta.nameArabic}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Verse {ayahNumber} of {surahId === 2 ? '286' : 'verified chapter'} · Tanzil Uthmani Text
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            title="Read another verified verse"
            aria-label="Cycle to next authentic verse"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700/80 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Another Verse</span>
          </button>

          <button
            onClick={handleCopy}
            title="Copy verse and citation"
            aria-label="Copy verse with translations and reference"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700/80 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => onNavigateToVerse(surahId, ayahNumber)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <BookOpen className="w-3 h-3" />
            <span>Read in Context</span>
          </button>
        </div>
      </div>

      {/* Authentic Arabic Text */}
      <div className="my-6">
        <p 
          lang="ar" 
          dir="rtl" 
          className="font-quran-arabic text-2xl sm:text-3xl lg:text-4xl text-stone-900 dark:text-stone-100 text-right leading-loose selection:bg-emerald-100 dark:selection:bg-emerald-900"
        >
          {verse.arabic}
        </p>
      </div>

      {/* Translations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100 dark:border-stone-800/80">
        {/* English (Saheeh International) */}
        <div>
          <div className="text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold mb-1">
            English · Saheeh International
          </div>
          <p 
            lang="en" 
            dir="ltr" 
            className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed font-serif"
          >
            "{verse.translations.en.text}"
          </p>
        </div>

        {/* Urdu (Fateh Muhammad Jalandhry) */}
        <div>
          <div className="text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold mb-1 text-right">
            اردو ترجمہ · فتح محمد جالندھری
          </div>
          <p 
            lang="ur" 
            dir="rtl" 
            className="font-quran-urdu text-stone-700 dark:text-stone-300 text-base sm:text-lg leading-relaxed text-right"
          >
            {verse.translations.ur.text}
          </p>
        </div>
      </div>
    </section>
  );
};
