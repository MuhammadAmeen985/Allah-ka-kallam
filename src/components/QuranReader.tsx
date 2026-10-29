import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark as BookmarkIcon,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Eye,
  Share2,
  Type,
  LayoutGrid,
  FileText,
  SlidersHorizontal,
  Home
} from 'lucide-react';
import { Bookmark, ReadingPreferences, SurahDetail, Verse } from '../types/quran';
import { fetchSurahDetail } from '../utils/quranApi';
import { isBookmarked, toggleBookmark, setLastRead } from '../utils/storage';

interface QuranReaderProps {
  surahId: number;
  initialAyahNumber?: number;
  preferences: ReadingPreferences;
  onUpdatePreferences: (pref: Partial<ReadingPreferences>) => void;
  onNavigateSurah: (id: number, ayah?: number) => void;
  onNavigateHome: () => void;
  onCopySuccess: (text: string) => void;
  onBookmarkChange?: () => void;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  surahId,
  initialAyahNumber,
  preferences,
  onUpdatePreferences,
  onNavigateSurah,
  onNavigateHome,
  onCopySuccess,
  onBookmarkChange,
}) => {
  const [surahData, setSurahData] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [bookmarkedSet, setBookmarkedSet] = useState<Set<number>>(new Set());
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [selectedJumpAyah, setSelectedJumpAyah] = useState<number>(1);

  const verseRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Load Surah details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchSurahDetail(surahId)
      .then((data) => {
        if (!isMounted) return;
        setSurahData(data);
        setLoading(false);

        // Update bookmarks set for this surah
        const bSet = new Set<number>();
        data.verses.forEach((v) => {
          if (isBookmarked(surahId, v.ayah)) {
            bSet.add(v.ayah);
          }
        });
        setBookmarkedSet(bSet);

        // Record last read
        setLastRead({
          surahId: data.id,
          ayahNumber: initialAyahNumber || 1,
          surahNameArabic: data.nameArabic,
          surahNameEnglish: data.nameEnglish,
          timestamp: Date.now()
        });

        // Jump to target ayah if provided
        if (initialAyahNumber && initialAyahNumber > 1) {
          setTimeout(() => {
            const el = verseRefs.current.get(initialAyahNumber);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 350);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setError(`Failed to load Surah ${surahId}. Please verify network connectivity or local dataset.`);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [surahId, initialAyahNumber]);

  // Handle bookmark toggle
  const handleToggleBookmark = (verse: Verse) => {
    if (!surahData) return;
    const bookmarkObj: Bookmark = {
      id: `surah-${surahData.id}-ayah-${verse.ayah}`,
      surahId: surahData.id,
      surahNameArabic: surahData.nameArabic,
      surahNameEnglish: surahData.nameEnglish,
      ayahNumber: verse.ayah,
      timestamp: Date.now(),
      arabicSnippet: verse.arabic,
      englishSnippet: verse.translations.en.text
    };

    const added = toggleBookmark(bookmarkObj);
    const updated = new Set(bookmarkedSet);
    if (added) {
      updated.add(verse.ayah);
      onCopySuccess(`Bookmarked Surah ${surahData.nameEnglish} [${surahData.id}:${verse.ayah}]`);
    } else {
      updated.delete(verse.ayah);
      onCopySuccess(`Removed bookmark for [${surahData.id}:${verse.ayah}]`);
    }
    setBookmarkedSet(updated);
    if (onBookmarkChange) onBookmarkChange();
  };

  // Handle copy verse
  const handleCopyVerse = (verse: Verse) => {
    if (!surahData) return;
    const text = `${verse.arabic}\n\nEnglish (Saheeh International):\n"${verse.translations.en.text}"\n\nاردو (فتح محمد جالندھری):\n${verse.translations.ur.text}\n\n— Surah ${surahData.nameEnglish} (${surahData.nameArabic}) [${surahData.id}:${verse.ayah}]\nAuthentic Tanzil Project Edition (tanzil.net)`;

    navigator.clipboard.writeText(text);
    setCopiedAyah(verse.ayah);
    onCopySuccess(`Copied Verse ${surahData.id}:${verse.ayah} with translations`);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  // Share verse
  const handleShareVerse = (verse: Verse) => {
    if (!surahData) return;
    const shareData = {
      title: `Surah ${surahData.nameEnglish} [${surahData.id}:${verse.ayah}]`,
      text: `${verse.arabic}\n\n"${verse.translations.en.text}"\n— [${surahData.id}:${verse.ayah}]`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      handleCopyVerse(verse);
    }
  };

  // Jump to Ayah inside current Surah
  const handleJumpToAyah = (ayahNum: number) => {
    setSelectedJumpAyah(ayahNum);
    const el = verseRefs.current.get(ayahNum);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Update last read
      if (surahData) {
        setLastRead({
          surahId: surahData.id,
          ayahNumber: ayahNum,
          surahNameArabic: surahData.nameArabic,
          surahNameEnglish: surahData.nameEnglish,
          timestamp: Date.now()
        });
      }
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-10 h-10 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="font-serif text-xl font-medium text-stone-800 dark:text-stone-200">
          Loading Surah {surahId}...
        </h2>
        <p className="text-sm text-stone-500 mt-2">
          Verifying Arabic Uthmani text and translations from Tanzil database
        </p>
      </main>
    );
  }

  if (error || !surahData) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-8">
          <h2 className="font-serif text-xl font-bold text-red-900 dark:text-red-200">
            Error Loading Surah
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300 mt-2">{error}</p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => onNavigateHome()}
              className="px-4 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-50"
            >
              Back to Home
            </button>
            <button
              onClick={() => onNavigateSurah(surahId)}
              className="px-4 py-2 text-sm bg-emerald-800 text-white rounded-lg hover:bg-emerald-900"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Display mode helpers
  const showArabic = preferences.showArabic;
  const showEnglish = preferences.showEnglish;
  const showUrdu = preferences.showUrdu;

  return (
    <main className="min-h-screen pb-24">
      {/* Sticky Reader Utility Bar */}
      <div className="sticky top-16 z-30 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 py-2 px-3 sm:px-4 transition-colors">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Surah Navigation: Home, Prev, Selector, Next */}
          <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onNavigateHome()}
                title="Return to Surah list"
                aria-label="Back to Surah list"
                className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
              </button>

              <button
                disabled={surahId <= 1}
                onClick={() => onNavigateSurah(surahId - 1)}
                aria-label="Previous Surah"
                className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Surah Selector */}
            <label htmlFor="surah-select" className="sr-only">Select Surah</label>
            <select
              id="surah-select"
              value={surahId}
              onChange={(e) => onNavigateSurah(parseInt(e.target.value, 10))}
              className="flex-1 sm:flex-initial text-xs sm:text-sm font-medium bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 text-stone-900 dark:text-stone-100 focus:outline-2 focus:outline-emerald-600 truncate max-w-[210px] sm:max-w-[260px]"
            >
              {Array.from({ length: 114 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}. {num === surahData.id ? surahData.nameTransliteration : `Surah ${num}`}
                </option>
              ))}
            </select>

            <button
              disabled={surahId >= 114}
              onClick={() => onNavigateSurah(surahId + 1)}
              aria-label="Next Surah"
              className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Reader Controls: Ayah jump, language toggles, view & settings */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-200/60 dark:border-stone-800/60">
            {/* Jump to Ayah selector */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span>Ayah:</span>
              <label htmlFor="ayah-select" className="sr-only">Jump to Ayah</label>
              <select
                id="ayah-select"
                value={selectedJumpAyah}
                onChange={(e) => handleJumpToAyah(parseInt(e.target.value, 10))}
                className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-1.5 py-1 text-xs text-stone-900 dark:text-stone-100 font-mono tabular-nums focus:outline-2 focus:outline-emerald-600"
              >
                {surahData.verses.map((v) => (
                  <option key={v.ayah} value={v.ayah}>
                    {v.ayah} / {surahData.ayahCount}
                  </option>
                ))}
              </select>
            </div>

            {/* Translation toggles segmented control */}
            <div className="flex items-center gap-0.5 p-0.5 bg-stone-200/60 dark:bg-stone-800/60 rounded-lg text-xs font-medium">
              <button
                onClick={() => onUpdatePreferences({ showArabic: !showArabic })}
                className={`px-2 py-0.5 rounded transition-colors ${
                  showArabic 
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs' 
                    : 'text-stone-500 dark:text-stone-400'
                }`}
                title="Toggle Arabic text"
              >
                عربي
              </button>
              <button
                onClick={() => onUpdatePreferences({ showEnglish: !showEnglish })}
                className={`px-2 py-0.5 rounded transition-colors ${
                  showEnglish 
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs' 
                    : 'text-stone-500 dark:text-stone-400'
                }`}
                title="Toggle English translation"
              >
                EN
              </button>
              <button
                onClick={() => onUpdatePreferences({ showUrdu: !showUrdu })}
                className={`px-2 py-0.5 rounded transition-colors ${
                  showUrdu 
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs' 
                    : 'text-stone-500 dark:text-stone-400'
                }`}
                title="Toggle Urdu translation"
              >
                اردو
              </button>
            </div>

            {/* Layout switch: Cards vs Continuous */}
            <button
              onClick={() => onUpdatePreferences({ readerMode: preferences.readerMode === 'cards' ? 'continuous' : 'cards' })}
              title={`Switch to ${preferences.readerMode === 'cards' ? 'continuous reading' : 'cards reading'}`}
              aria-label="Switch reading layout"
              className="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              {preferences.readerMode === 'cards' ? (
                <FileText className="w-4 h-4" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
            </button>

            {/* Settings button to adjust font size */}
            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              title="Reading display & typography preferences"
              aria-label="Toggle typography preferences drawer"
              className={`p-1.5 rounded-lg transition-colors ${
                showSettingsDrawer
                  ? 'bg-emerald-800 text-white dark:bg-emerald-700'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dropdown settings drawer */}
        {showSettingsDrawer && (
          <div className="max-w-5xl mx-auto mt-3 pt-3 border-t border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Arabic Font Size */}
            <div>
              <div className="flex justify-between text-stone-600 dark:text-stone-400 mb-1">
                <span>Arabic Font Size</span>
                <span className="font-mono tabular-nums">{preferences.arabicFontSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="44"
                step="2"
                value={preferences.arabicFontSize}
                onChange={(e) => onUpdatePreferences({ arabicFontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-700"
              />
            </div>

            {/* Translation Font Size */}
            <div>
              <div className="flex justify-between text-stone-600 dark:text-stone-400 mb-1">
                <span>Translation Font Size</span>
                <span className="font-mono tabular-nums">{preferences.translationFontSize}px</span>
              </div>
              <input
                type="range"
                min="13"
                max="22"
                step="1"
                value={preferences.translationFontSize}
                onChange={(e) => onUpdatePreferences({ translationFontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-700"
              />
            </div>

            {/* Theme switcher */}
            <div>
              <div className="text-stone-600 dark:text-stone-400 mb-1">Reading Theme</div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdatePreferences({ theme: 'light' })}
                  className={`flex-1 py-1 px-2 rounded border text-center ${
                    preferences.theme === 'light'
                      ? 'bg-stone-100 border-stone-400 font-semibold text-stone-900'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => onUpdatePreferences({ theme: 'sepia' })}
                  className={`flex-1 py-1 px-2 rounded border text-center ${
                    preferences.theme === 'sepia'
                      ? 'bg-amber-100 border-amber-400 font-semibold text-amber-900'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Parchment
                </button>
                <button
                  onClick={() => onUpdatePreferences({ theme: 'dark' })}
                  className={`flex-1 py-1 px-2 rounded border text-center ${
                    preferences.theme === 'dark'
                      ? 'bg-stone-800 border-stone-600 font-semibold text-stone-100'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Surah Header Block */}
      <section className="max-w-4xl mx-auto px-4 pt-10 pb-6 text-center">
        {/* Curatorial Header */}
        <div className="inline-block px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-md text-xs uppercase tracking-widest font-sans mb-3 font-semibold">
          Surah {surahData.id} · {surahData.revelationType} · {surahData.ayahCount} Ayahs
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          {surahData.nameTransliteration}
        </h1>
        <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 mt-1">
          {surahData.nameEnglish} · Revelation Chronology: #{surahData.revelationOrder}
        </p>

        <div className="mt-4">
          <span 
            lang="ar" 
            dir="rtl" 
            className="font-quran-arabic text-3xl sm:text-4xl text-emerald-800 dark:text-emerald-400 font-bold"
          >
            سورة {surahData.nameArabic}
          </span>
        </div>

        {/* Bismillah Header (Except Surah 9 At-Tawbah) */}
        {surahData.id !== 9 && surahData.id !== 1 && (
          <div className="mt-10 py-5 px-6 border-y border-stone-200/80 dark:border-stone-800 max-w-xl mx-auto">
            <p 
              lang="ar" 
              dir="rtl" 
              className="font-quran-arabic text-2xl sm:text-3xl text-stone-800 dark:text-stone-200"
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-serif mt-1">
              In the name of Allah, the Entirely Merciful, the Especially Merciful.
            </p>
          </div>
        )}

        {surahData.id === 9 && (
          <div className="mt-8 py-3 px-4 bg-stone-100/80 dark:bg-stone-800/80 rounded-lg text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            Note: Surah At-Tawbah does not open with the Bismillah, in accordance with authentic Quranic tradition.
          </div>
        )}
      </section>

      {/* Verses Container */}
      <section 
        aria-label="Quran Verses" 
        className={`max-w-4xl mx-auto px-4 mt-6 ${
          preferences.readerMode === 'cards' ? 'space-y-6' : 'space-y-4'
        }`}
      >
        {surahData.verses.map((verse) => {
          const isTargetAyah = initialAyahNumber === verse.ayah;
          const bookmarked = bookmarkedSet.has(verse.ayah);
          const isCopied = copiedAyah === verse.ayah;

          return (
            <article
              key={verse.ayah}
              id={`ayah-${verse.ayah}`}
              ref={(el) => {
                if (el) verseRefs.current.set(verse.ayah, el);
              }}
              className={`group transition-all duration-200 rounded-2xl ${
                preferences.readerMode === 'cards'
                  ? 'bg-white dark:bg-stone-900/80 border p-6 sm:p-7 shadow-xs'
                  : 'bg-transparent border-b pb-6 px-2'
              } ${
                isTargetAyah
                  ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                  : 'border-stone-200 dark:border-stone-800/90'
              }`}
            >
              {/* Verse Top Bar: Ayah Number & Quick Actions */}
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-stone-100 dark:border-stone-800/60 mb-5">
                {/* Ayah number badge */}
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-mono text-xs font-semibold text-stone-700 dark:text-stone-300 tabular-nums border border-stone-200 dark:border-stone-700">
                    {verse.ayah}
                  </span>
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    {surahData.id}:{verse.ayah}
                  </span>
                </div>

                {/* Verse Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleBookmark(verse)}
                    title={bookmarked ? 'Remove bookmark' : 'Bookmark this verse'}
                    aria-label={`Bookmark Surah ${surahData.nameEnglish} Ayah ${verse.ayah}`}
                    className={`p-1.5 rounded-lg transition-colors ${
                      bookmarked
                        ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <BookmarkIcon className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleCopyVerse(verse)}
                    title="Copy verse"
                    aria-label={`Copy Surah ${surahData.nameEnglish} Ayah ${verse.ayah}`}
                    className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleShareVerse(verse)}
                    title="Share verse"
                    aria-label={`Share Surah ${surahData.nameEnglish} Ayah ${verse.ayah}`}
                    className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Arabic Uthmani Text */}
              {showArabic && (
                <div className="my-4">
                  <p
                    lang="ar"
                    dir="rtl"
                    style={{ fontSize: `${preferences.arabicFontSize}px` }}
                    className="font-quran-arabic text-stone-900 dark:text-stone-100 text-right selection:bg-emerald-100 dark:selection:bg-emerald-900"
                  >
                    {verse.arabic}
                    {/* Verse end sign */}
                    <span 
                      aria-hidden="true" 
                      className="inline-block mx-2 text-emerald-800/80 dark:text-emerald-400/80 font-mono text-sm align-middle select-none"
                    >
                      ۝{verse.ayah}
                    </span>
                  </p>
                </div>
              )}

              {/* Translations Area */}
              {(showEnglish || showUrdu) && (
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800/60 space-y-3">
                  {/* English Translation */}
                  {showEnglish && (
                    <div className="text-left">
                      <div className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold mb-1">
                        English · Saheeh International
                      </div>
                      <p
                        lang="en"
                        dir="ltr"
                        style={{ fontSize: `${preferences.translationFontSize}px` }}
                        className="font-serif text-stone-700 dark:text-stone-300 leading-relaxed"
                      >
                        {verse.translations.en.text}
                      </p>
                    </div>
                  )}

                  {/* Urdu Translation */}
                  {showUrdu && (
                    <div className="text-right pt-2">
                      <div className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-semibold mb-1">
                        اردو ترجمہ · فتح محمد جالندھری
                      </div>
                      <p
                        lang="ur"
                        dir="rtl"
                        style={{ fontSize: `${Math.round(preferences.translationFontSize * 1.15)}px` }}
                        className="font-quran-urdu text-stone-700 dark:text-stone-300 leading-relaxed text-right"
                      >
                        {verse.translations.ur.text}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Bottom Surah Navigation Footer */}
      <div className="max-w-4xl mx-auto px-4 mt-12 pt-8 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
        {surahId > 1 ? (
          <button
            onClick={() => onNavigateSurah(surahId - 1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-700 dark:text-stone-300 hover:border-emerald-700 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Surah ({surahId - 1})</span>
          </button>
        ) : <div />}

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-serif"
        >
          Return to top ↑
        </button>

        {surahId < 114 ? (
          <button
            onClick={() => onNavigateSurah(surahId + 1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-700 dark:text-stone-300 hover:border-emerald-700 transition-colors text-sm font-medium"
          >
            <span>Next Surah ({surahId + 1})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : <div />}
      </div>
    </main>
  );
};
