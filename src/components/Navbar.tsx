import React, { useState } from 'react';
import { Bookmark, BookOpen, Info, Moon, Search, Sun, Sparkles, Menu, X } from 'lucide-react';
import { ReadingPreferences } from '../types/quran';

interface NavbarProps {
  activeView: 'home' | 'reader' | 'bookmarks' | 'about';
  onNavigate: (view: 'home' | 'reader' | 'bookmarks' | 'about') => void;
  onOpenSearch: () => void;
  bookmarksCount: number;
  preferences: ReadingPreferences;
  onUpdatePreferences: (pref: Partial<ReadingPreferences>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onOpenSearch,
  bookmarksCount,
  preferences,
  onUpdatePreferences
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const nextTheme = preferences.theme === 'light' ? 'sepia' : preferences.theme === 'sepia' ? 'dark' : 'light';
    onUpdatePreferences({ theme: nextTheme });
  };

  const handleNavClick = (view: 'home' | 'reader' | 'bookmarks' | 'about') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand wordmark (single element, 1 line) */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 sm:gap-3 text-left group whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-600 rounded"
        >
          <span className="font-serif text-lg sm:text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
            The Holy Quran
          </span>
          <span className="text-stone-300 dark:text-stone-700 select-none">|</span>
          <span className="font-quran-arabic text-base sm:text-xl text-emerald-800 dark:text-emerald-400 font-bold group-hover:text-emerald-900 dark:group-hover:text-emerald-300 transition-colors">
            القرآن الكريم
          </span>
        </button>

        {/* Zone 2: Navigation Links (single line, clean typography) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={() => handleNavClick('home')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              activeView === 'home'
                ? 'text-emerald-800 dark:text-emerald-400 border-emerald-700 dark:border-emerald-400 font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Surah Index
          </button>

          <button
            onClick={() => handleNavClick('reader')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              activeView === 'reader'
                ? 'text-emerald-800 dark:text-emerald-400 border-emerald-700 dark:border-emerald-400 font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Quran Reader
          </button>

          <button
            onClick={() => handleNavClick('bookmarks')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeView === 'bookmarks'
                ? 'text-emerald-800 dark:text-emerald-400 border-emerald-700 dark:border-emerald-400 font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <span>Bookmarks</span>
            {bookmarksCount > 0 && (
              <span className="text-xs font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                ({bookmarksCount})
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              activeView === 'about'
                ? 'text-emerald-800 dark:text-emerald-400 border-emerald-700 dark:border-emerald-400 font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Sources & Integrity
          </button>
        </nav>

        {/* Zone 3: Primary Action & Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            aria-label={`Current theme: ${preferences.theme}. Click to switch theme.`}
            title={`Switch theme (Current: ${preferences.theme})`}
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            {preferences.theme === 'light' ? (
              <Sun className="w-4 h-4" />
            ) : preferences.theme === 'sepia' ? (
              <Sparkles className="w-4 h-4 text-amber-600" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Primary CTA: Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-emerald-600 whitespace-nowrap shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Search</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-emerald-950/40 rounded border border-emerald-700/50 text-emerald-100 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-4 py-3 space-y-2">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium ${
              activeView === 'home'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            Surah Index (114 Surahs)
          </button>
          <button
            onClick={() => handleNavClick('reader')}
            className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium ${
              activeView === 'reader'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            Quran Reader
          </button>
          <button
            onClick={() => handleNavClick('bookmarks')}
            className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-between ${
              activeView === 'bookmarks'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            <span>Saved Bookmarks</span>
            <span className="text-xs font-mono tabular-nums text-emerald-800 dark:text-emerald-400">
              ({bookmarksCount})
            </span>
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium ${
              activeView === 'about'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            Sources & Data Integrity (Tanzil)
          </button>
        </div>
      )}
    </header>
  );
};
