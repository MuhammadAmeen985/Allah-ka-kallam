/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Languages,
  CheckCircle2,
  ExternalLink,
  History
} from 'lucide-react';
import { Bookmark as BookmarkType, DatasetManifest, LastReadPosition, ReadingPreferences, SurahMeta } from './types/quran';
import { fetchDatasetManifest, fetchSurahList } from './utils/quranApi';
import { getBookmarks, getLastRead, getPreferences, removeBookmark, saveBookmarks, setPreferences } from './utils/storage';
import { CURATED_DAILY_VERSES, DailyAyahItem, getDailyAyah } from './utils/dailyAyahs';
import { Navbar } from './components/Navbar';
import { DailyAyahCard } from './components/DailyAyahCard';
import { SurahDirectory } from './components/SurahDirectory';
import { QuranReader } from './components/QuranReader';
import { SearchModal } from './components/SearchModal';
import { BookmarksModal } from './components/BookmarksModal';
import { AboutModal } from './components/AboutModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'reader' | 'bookmarks' | 'about'>('home');
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [manifest, setManifest] = useState<DatasetManifest | null>(null);
  const [loadingSurahs, setLoadingSurahs] = useState(true);

  // Active Reader states
  const [currentSurahId, setCurrentSurahId] = useState<number>(1);
  const [targetAyahNumber, setTargetAyahNumber] = useState<number | undefined>(undefined);

  // User storage state
  const [preferences, setPreferencesState] = useState<ReadingPreferences>(getPreferences());
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [lastRead, setLastReadState] = useState<LastReadPosition | null>(null);

  // Daily Ayah state
  const [dailyAyah, setDailyAyah] = useState<DailyAyahItem | null>(null);
  const [dailyAyahIndex, setDailyAyahIndex] = useState<number>(0);
  const [loadingDailyAyah, setLoadingDailyAyah] = useState<boolean>(true);

  // Modals & Feedback
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Load initial data
  useEffect(() => {
    // Sync storage
    setBookmarks(getBookmarks());
    setLastReadState(getLastRead());

    // Fetch surah metadata & manifest
    Promise.all([fetchSurahList(), fetchDatasetManifest()])
      .then(([surahData, manifestData]) => {
        setSurahs(surahData);
        setManifest(manifestData);
        setLoadingSurahs(false);
      })
      .catch((err) => {
        console.error('Initial data load error:', err);
        setLoadingSurahs(false);
      });

    // Fetch initial daily ayah
    getDailyAyah(0)
      .then((ayahData) => {
        setDailyAyah(ayahData);
        setLoadingDailyAyah(false);
      })
      .catch(() => setLoadingDailyAyah(false));
  }, []);

  // Sync theme with HTML root element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-sepia');
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'sepia') {
      root.classList.add('theme-sepia');
    }
  }, [preferences.theme]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update preferences helper
  const handleUpdatePreferences = (partial: Partial<ReadingPreferences>) => {
    const updated = setPreferences(partial);
    setPreferencesState(updated);
  };

  // Toast feedback helper
  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToast({ id: Math.random().toString(), text, type });
  };

  // Navigate to Surah in reader
  const handleSelectSurah = (surahId: number, ayahNumber?: number) => {
    setCurrentSurahId(surahId);
    setTargetAyahNumber(ayahNumber);
    setActiveView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cycle daily ayah
  const handleCycleDailyAyah = () => {
    setLoadingDailyAyah(true);
    const nextIdx = (dailyAyahIndex + 1) % CURATED_DAILY_VERSES.length;
    setDailyAyahIndex(nextIdx);
    getDailyAyah(nextIdx)
      .then((ayahData) => {
        setDailyAyah(ayahData);
        setLoadingDailyAyah(false);
      })
      .catch(() => setLoadingDailyAyah(false));
  };

  // Bookmarks handlers
  const handleRemoveBookmark = (id: string) => {
    const remaining = removeBookmark(id);
    setBookmarks(remaining);
    showToast('Bookmark removed', 'info');
  };

  const handleClearAllBookmarks = () => {
    if (window.confirm('Are you sure you want to remove all saved bookmarks?')) {
      saveBookmarks([]);
      setBookmarks([]);
      showToast('All bookmarks cleared', 'info');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf7] dark:bg-[#0f1412] text-stone-900 dark:text-stone-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        onNavigate={(view) => {
          if (view === 'about') {
            setIsAboutOpen(true);
          } else if (view === 'bookmarks') {
            setIsBookmarksOpen(true);
          } else {
            setActiveView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        bookmarksCount={bookmarks.length}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
      />

      {/* Main View Router */}
      {activeView === 'home' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Hero Section */}
          <section className="text-center py-10 sm:py-16 max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-widest font-sans font-semibold text-emerald-800 dark:text-emerald-400 mb-3 inline-block">
              بسم الله الرحمن الرحيم · Read. Reflect. Learn.
            </span>

            {/* Arabic Calligraphy Title */}
            <h1 
              lang="ar" 
              dir="rtl" 
              className="font-quran-arabic text-5xl sm:text-6xl lg:text-7xl text-stone-900 dark:text-stone-100 font-bold tracking-normal my-2"
            >
              القرآن الكريم
            </h1>

            {/* English Title */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mt-1">
              The Holy Quran
            </h2>

            <p className="mt-4 text-base sm:text-lg text-stone-600 dark:text-stone-300 font-serif leading-relaxed max-w-2xl mx-auto">
              An authentic, respectful, and distraction-free digital reading sanctuary featuring verified Uthmani Arabic text, English (Saheeh International), and Urdu (Fateh Muhammad Jalandhry) translations.
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleSelectSurah(lastRead ? lastRead.surahId : 1, lastRead?.ayahNumber)}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl font-medium text-sm sm:text-base transition-all shadow-md hover:shadow-lg focus-visible:outline-2 focus-visible:outline-emerald-600"
              >
                <BookOpen className="w-5 h-5" />
                <span>{lastRead ? `Continue Reading: Surah ${lastRead.surahNameEnglish}` : 'Start Reading from Surah 1'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-5 py-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-700 dark:hover:border-emerald-600 text-stone-700 dark:text-stone-200 rounded-xl font-medium text-sm sm:text-base transition-all shadow-xs"
              >
                <Search className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span>Search Ayah or Keyword</span>
              </button>
            </div>
          </section>

          {/* Continue Reading Banner (if last read exists) */}
          {lastRead && (
            <div className="mb-10 max-w-4xl mx-auto p-4 sm:p-5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 bg-emerald-800 dark:bg-emerald-700 text-white rounded-lg shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-emerald-900 dark:text-emerald-400 font-semibold">
                    Continue Reading
                  </div>
                  <h4 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 truncate">
                    Surah {lastRead.surahNameEnglish} ({lastRead.surahNameArabic}) · Ayah {lastRead.ayahNumber}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => handleSelectSurah(lastRead.surahId, lastRead.ayahNumber)}
                className="shrink-0 px-4 py-2 bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 rounded-lg text-xs sm:text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
              >
                Resume
              </button>
            </div>
          )}

          {/* Daily Ayah Feature */}
          <div className="max-w-4xl mx-auto mb-12">
            <DailyAyahCard
              dailyAyah={dailyAyah}
              loading={loadingDailyAyah}
              onRefresh={handleCycleDailyAyah}
              onNavigateToVerse={handleSelectSurah}
              onCopySuccess={(text) => showToast(text, 'success')}
            />
          </div>

          {/* Authentic Architecture Pillars */}
          <section 
            aria-label="Features and Authenticity" 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto my-12"
          >
            <div className="p-6 bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
                Official Tanzil Uthmani Text
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                Verbatim reproduction under Creative Commons Attribution 3.0. Zero AI hallucination, modification, or paraphrasing.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
                English & Urdu Aligned
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                Full 6,236 verses paired with Saheeh International (EN) and Fateh Muhammad Jalandhry (UR) with proper typography and RTL alignment.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">
                Private & Static
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                Bookmarks and reading progress remain strictly in your browser. Zero tracking, zero telemetry, and fully prepared for GitHub Pages.
              </p>
            </div>
          </section>

          {/* 114 Surahs Directory */}
          <SurahDirectory
            surahs={surahs}
            loading={loadingSurahs}
            onSelectSurah={(id) => handleSelectSurah(id, 1)}
            lastReadSurahId={lastRead?.surahId}
          />
        </main>
      )}

      {/* Reader View */}
      {activeView === 'reader' && (
        <QuranReader
          surahId={currentSurahId}
          initialAyahNumber={targetAyahNumber}
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          onNavigateSurah={(id, ayah) => {
            setCurrentSurahId(id);
            setTargetAyahNumber(ayah);
          }}
          onNavigateHome={() => setActiveView('home')}
          onCopySuccess={(text) => showToast(text, 'success')}
          onBookmarkChange={() => setBookmarks(getBookmarks())}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-950/50 py-8 px-4 text-xs text-stone-500 transition-colors">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-serif font-semibold text-stone-800 dark:text-stone-200">
              The Holy Quran — القرآن الكريم · Read. Reflect. Learn.
            </p>
            <p className="mt-1">
              Quran Text sourced from the{' '}
              <a
                href="https://tanzil.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 dark:text-emerald-400 hover:underline"
              >
                Tanzil Project
              </a>{' '}
              under Creative Commons Attribution 3.0 (CC BY 3.0).
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-stone-900 dark:hover:text-stone-100 underline"
            >
              Dataset Attribution & Integrity
            </button>
            <span>·</span>
            <button
              onClick={() => setIsBookmarksOpen(true)}
              className="hover:text-stone-900 dark:hover:text-stone-100 underline"
            >
              Saved Bookmarks ({bookmarks.length})
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(sId, aNum) => handleSelectSurah(sId, aNum)}
      />

      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onSelectBookmark={(sId, aNum) => handleSelectSurah(sId, aNum)}
        onClearAll={handleClearAllBookmarks}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        manifest={manifest}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
