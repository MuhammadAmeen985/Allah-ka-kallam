import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search as SearchIcon, X, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { SearchResultItem, SurahMeta } from '../types/quran';
import { fetchSearchIndex, fetchSurahList } from '../utils/quranApi';
import {
  normalizeArabicForSearch,
  normalizeEnglishForSearch,
  normalizeUrduForSearch,
  parseAyahReference
} from '../utils/arabicSearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (surahId: number, ayahNumber: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'ayahs' | 'surahs'>('all');
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [searchIndex, setSearchIndex] = useState<any[] | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // Pre-load surahs list
      fetchSurahList().then(setSurahs).catch(console.error);

      // Lazily load full search index if not loaded
      if (!searchIndex && !loadingIndex) {
        setLoadingIndex(true);
        fetchSearchIndex()
          .then((idx) => {
            setSearchIndex(idx);
            setLoadingIndex(false);
          })
          .catch((err) => {
            console.error('Failed to load search index:', err);
            setError('Could not load full text search index. Local Surah search is still available.');
            setLoadingIndex(false);
          });
      }
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Execute Search
  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];

    const matchedResults: SearchResultItem[] = [];

    // 1. Check for specific Ayah Reference (e.g. "2:255", "36:1")
    const ref = parseAyahReference(q);
    if (ref && surahs.length > 0) {
      const targetSurah = surahs.find((s) => s.id === ref.surahId);
      if (targetSurah && ref.ayahNumber <= targetSurah.ayahCount) {
        matchedResults.push({
          surahId: ref.surahId,
          ayahNumber: ref.ayahNumber,
          surahNameArabic: targetSurah.nameArabic,
          surahNameEnglish: targetSurah.nameEnglish,
          surahNameTransliteration: targetSurah.nameTransliteration,
          arabicText: '',
          englishText: '',
          urduText: '',
          matchType: 'reference',
          matchedSnippet: `Direct reference to Surah ${targetSurah.nameEnglish} [${ref.surahId}:${ref.ayahNumber}]`
        });
      }
    }

    // 2. Check for Surah Names & Numbers
    const qLower = q.toLowerCase();
    for (const s of surahs) {
      if (
        s.id.toString() === q ||
        s.nameEnglish.toLowerCase().includes(qLower) ||
        s.nameTransliteration.toLowerCase().includes(qLower) ||
        s.nameArabic.includes(q)
      ) {
        matchedResults.push({
          surahId: s.id,
          ayahNumber: 1,
          surahNameArabic: s.nameArabic,
          surahNameEnglish: s.nameEnglish,
          surahNameTransliteration: s.nameTransliteration,
          arabicText: '',
          englishText: '',
          urduText: '',
          matchType: 'surah',
          matchedSnippet: `Surah ${s.id}: ${s.nameTransliteration} (${s.nameEnglish}) · ${s.revelationType} · ${s.ayahCount} Ayahs`
        });
      }
    }

    // 3. Full-text search across all 6,236 Ayahs (if index is loaded)
    if (searchIndex && q.length >= 2) {
      const normArabicQ = normalizeArabicForSearch(q);
      const normUrduQ = normalizeUrduForSearch(q);
      const normEnglishQ = normalizeEnglishForSearch(q);

      let count = 0;
      const MAX_TEXT_RESULTS = 50;

      for (const item of searchIndex) {
        if (count >= MAX_TEXT_RESULTS) break;

        const surahMeta = surahs.find((s) => s.id === item.s);
        const sNameEn = surahMeta?.nameEnglish || `Surah ${item.s}`;
        const sNameTr = surahMeta?.nameTransliteration || '';
        const sNameAr = surahMeta?.nameArabic || '';

        // Arabic search (normalized match without altering original raw text)
        if (normArabicQ.length >= 2) {
          const normArText = normalizeArabicForSearch(item.ar);
          if (normArText.includes(normArabicQ)) {
            matchedResults.push({
              surahId: item.s,
              ayahNumber: item.a,
              surahNameArabic: sNameAr,
              surahNameEnglish: sNameEn,
              surahNameTransliteration: sNameTr,
              arabicText: item.ar,
              englishText: item.en,
              urduText: item.ur,
              matchType: 'arabic',
              matchedSnippet: item.ar
            });
            count++;
            continue;
          }
        }

        // English translation search
        if (normEnglishQ.length >= 2) {
          const normEnText = normalizeEnglishForSearch(item.en);
          if (normEnText.includes(normEnglishQ)) {
            matchedResults.push({
              surahId: item.s,
              ayahNumber: item.a,
              surahNameArabic: sNameAr,
              surahNameEnglish: sNameEn,
              surahNameTransliteration: sNameTr,
              arabicText: item.ar,
              englishText: item.en,
              urduText: item.ur,
              matchType: 'english',
              matchedSnippet: item.en
            });
            count++;
            continue;
          }
        }

        // Urdu translation search
        if (normUrduQ.length >= 2) {
          const normUrText = normalizeUrduForSearch(item.ur);
          if (normUrText.includes(normUrduQ)) {
            matchedResults.push({
              surahId: item.s,
              ayahNumber: item.a,
              surahNameArabic: sNameAr,
              surahNameEnglish: sNameEn,
              surahNameTransliteration: sNameTr,
              arabicText: item.ar,
              englishText: item.en,
              urduText: item.ur,
              matchType: 'urdu',
              matchedSnippet: item.ur
            });
            count++;
            continue;
          }
        }
      }
    }

    return matchedResults;
  }, [query, surahs, searchIndex]);

  // Tab filtering
  const displayResults = useMemo(() => {
    if (activeTab === 'surahs') {
      return results.filter((r) => r.matchType === 'surah');
    }
    if (activeTab === 'ayahs') {
      return results.filter((r) => r.matchType !== 'surah');
    }
    return results;
  }, [results, activeTab]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-stone-200 dark:border-stone-800 p-4 flex items-center gap-3">
          <SearchIcon className="w-5 h-5 text-emerald-800 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            id="search-modal-title"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Surah name, Ayah (e.g. 2:255), Arabic, English, or Urdu..."
            className="w-full text-base sm:text-lg bg-transparent border-none outline-hidden text-stone-900 dark:text-stone-100 placeholder-stone-400 font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close search"
            className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 rounded font-mono"
          >
            ESC
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/50 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            All Results ({results.length})
          </button>
          <button
            onClick={() => setActiveTab('surahs')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'surahs'
                ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Surahs ({results.filter((r) => r.matchType === 'surah').length})
          </button>
          <button
            onClick={() => setActiveTab('ayahs')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'ayahs'
                ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Verses ({results.filter((r) => r.matchType !== 'surah').length})
          </button>

          {loadingIndex && (
            <span className="ml-auto text-[11px] text-stone-400 animate-pulse">
              Loading 6,236 verses index...
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 flex-1 divide-y divide-stone-100 dark:divide-stone-800/60">
          {query.trim().length === 0 ? (
            <div className="py-12 text-center text-stone-400 dark:text-stone-500 text-sm">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-emerald-700/60" />
              <p className="font-serif">Search anything in the Holy Quran</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded">Try "2:255"</span>
                <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded">"merciful"</span>
                <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded">"Yaseen"</span>
                <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded">"رحمان"</span>
                <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded">"بڑا مہربان"</span>
              </div>
            </div>
          ) : displayResults.length === 0 ? (
            <div className="py-12 text-center text-stone-500 dark:text-stone-400 text-sm">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-stone-400" />
              <p>No results found for "{query}".</p>
              <p className="text-xs text-stone-400 mt-1">
                Try searching in English, Arabic, Urdu, or by Surah number:Ayah (e.g. 2:255).
              </p>
            </div>
          ) : (
            displayResults.map((result, idx) => (
              <button
                key={`${result.surahId}-${result.ayahNumber}-${idx}`}
                onClick={() => {
                  onSelectResult(result.surahId, result.ayahNumber);
                  onClose();
                }}
                className="w-full text-left py-3.5 px-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors flex items-start justify-between gap-4 group"
              >
                <div className="min-w-0 flex-1">
                  {/* Reference kicker */}
                  <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 font-sans mb-1">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                      Surah {result.surahNameTransliteration || result.surahId}
                    </span>
                    <span>·</span>
                    <span className="tabular-nums font-mono">
                      Ayah {result.ayahNumber} ({result.surahId}:{result.ayahNumber})
                    </span>
                    <span className="uppercase text-[10px] px-1.5 py-0.2 bg-stone-100 dark:bg-stone-800 rounded text-stone-500">
                      {result.matchType}
                    </span>
                  </div>

                  {/* Matched Snippet */}
                  {result.arabicText && (
                    <p
                      lang="ar"
                      dir="rtl"
                      className="font-quran-arabic text-base sm:text-lg text-stone-900 dark:text-stone-100 my-1 line-clamp-2 text-right"
                    >
                      {result.arabicText}
                    </p>
                  )}

                  {result.englishText && (
                    <p
                      lang="en"
                      dir="ltr"
                      className="font-serif text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-2"
                    >
                      "{result.englishText}"
                    </p>
                  )}

                  {result.urduText && (
                    <p
                      lang="ur"
                      dir="rtl"
                      className="font-quran-urdu text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-1 text-right mt-1"
                    >
                      {result.urduText}
                    </p>
                  )}

                  {!result.arabicText && (
                    <p className="text-sm text-stone-800 dark:text-stone-200 font-serif">
                      {result.matchedSnippet}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center text-stone-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
