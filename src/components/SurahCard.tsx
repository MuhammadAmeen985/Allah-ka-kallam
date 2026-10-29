import React from 'react';
import { SurahMeta } from '../types/quran';

interface SurahCardProps {
  surah: SurahMeta;
  onSelect: (surahId: number) => void;
  isLastRead?: boolean;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, onSelect, isLastRead }) => {
  return (
    <button
      onClick={() => onSelect(surah.id)}
      className={`group relative text-left w-full p-5 bg-white dark:bg-stone-900/80 border rounded-xl transition-all duration-150 hover:shadow-md hover:border-emerald-600/50 dark:hover:border-emerald-500/50 focus-visible:outline-2 focus-visible:outline-emerald-600 flex items-center justify-between gap-4 ${
        isLastRead 
          ? 'border-emerald-600/80 dark:border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20' 
          : 'border-stone-200 dark:border-stone-800'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Surah Number Badge */}
        <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-mono text-sm font-semibold text-stone-700 dark:text-stone-300 group-hover:bg-emerald-800 group-hover:text-white dark:group-hover:bg-emerald-700 transition-colors shrink-0 tabular-nums">
          {surah.id}
        </div>

        {/* English & Transliteration metadata */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
              {surah.nameTransliteration}
            </h4>
            {isLastRead && (
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                · Last Read
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
            {surah.nameEnglish}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 mt-1 font-sans">
            <span>{surah.revelationType}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{surah.ayahCount} Verses</span>
          </div>
        </div>
      </div>

      {/* Arabic Calligraphy Name */}
      <div className="text-right shrink-0">
        <span 
          lang="ar" 
          dir="rtl" 
          className="font-quran-arabic text-2xl text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors"
        >
          {surah.nameArabic}
        </span>
      </div>
    </button>
  );
};
