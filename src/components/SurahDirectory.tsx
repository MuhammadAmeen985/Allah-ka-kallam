import React, { useMemo, useState } from 'react';
import { Search, ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import { SurahMeta } from '../types/quran';
import { SurahCard } from './SurahCard';

interface SurahDirectoryProps {
  surahs: SurahMeta[];
  loading: boolean;
  onSelectSurah: (surahId: number) => void;
  lastReadSurahId?: number;
}

export const SurahDirectory: React.FC<SurahDirectoryProps> = ({
  surahs,
  loading,
  onSelectSurah,
  lastReadSurahId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [sortBy, setSortBy] = useState<'mushaf' | 'revelation'>('mushaf');

  const filteredSurahs = useMemo(() => {
    let result = [...surahs];

    // Filter by revelation type
    if (filterType !== 'all') {
      result = result.filter(s => s.revelationType === filterType);
    }

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(s => 
        s.id.toString() === q ||
        s.nameEnglish.toLowerCase().includes(q) ||
        s.nameTransliteration.toLowerCase().includes(q) ||
        s.nameArabic.includes(q)
      );
    }

    // Sort
    if (sortBy === 'revelation') {
      result.sort((a, b) => a.revelationOrder - b.revelationOrder);
    } else {
      result.sort((a, b) => a.id - b.id);
    }

    return result;
  }, [surahs, filterType, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-500 font-serif">Loading 114 Surahs from verified Tanzil edition...</p>
      </div>
    );
  }

  return (
    <section aria-label="Surah Directory" className="mt-12">
      {/* Directory Title & Interactive Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            Surahs of the Quran · سور القرآن
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Complete 114 Surahs with authentic verse counts and revelation details
          </p>
        </div>

        {/* Search bar inside directory */}
        <div className="w-full md:w-72 relative">
          <label htmlFor="surah-search" className="sr-only">Filter Surahs by name or number</label>
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="surah-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter Surah (e.g. Baqarah, 36)..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-2 focus:outline-emerald-600 transition-colors"
          />
        </div>
      </div>

      {/* Controls Bar: Type Filter & Sort Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        {/* Revelation Type Filter Tabs (functional segmented control) */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/60 dark:bg-stone-800/60 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            All 114 Surahs
          </button>
          <button
            onClick={() => setFilterType('Meccan')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'Meccan'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Meccan (مكية)
          </button>
          <button
            onClick={() => setFilterType('Medinan')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'Medinan'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Medinan (مدنية)
          </button>
        </div>

        {/* Sort order toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 dark:text-stone-500">Order:</span>
          <button
            onClick={() => setSortBy(sortBy === 'mushaf' ? 'revelation' : 'mushaf')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg hover:border-emerald-600/50 transition-colors"
          >
            <ArrowUpDown className="w-3 h-3 text-stone-500" />
            <span>{sortBy === 'mushaf' ? 'Mushaf Order (1–114)' : 'Revelation Chronology'}</span>
          </button>
        </div>
      </div>

      {/* Surahs Grid */}
      {filteredSurahs.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl my-4">
          <p className="text-base text-stone-600 dark:text-stone-400 font-serif">No Surah found matching "{searchQuery}"</p>
          <button
            onClick={() => { setSearchQuery(''); setFilterType('all'); }}
            className="mt-3 text-xs text-emerald-800 dark:text-emerald-400 font-semibold hover:underline"
          >
            Clear search filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredSurahs.map(surah => (
            <SurahCard
              key={surah.id}
              surah={surah}
              onSelect={onSelectSurah}
              isLastRead={surah.id === lastReadSurahId}
            />
          ))}
        </div>
      )}
    </section>
  );
};
