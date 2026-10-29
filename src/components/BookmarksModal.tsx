import React from 'react';
import { Bookmark as BookmarkIcon, Trash2, BookOpen, X, Share2 } from 'lucide-react';
import { Bookmark } from '../types/quran';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onRemoveBookmark: (id: string) => void;
  onSelectBookmark: (surahId: number, ayahNumber: number) => void;
  onClearAll: () => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onSelectBookmark,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bookmarks-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <BookmarkIcon className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <h2 id="bookmarks-modal-title" className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
              Saved Bookmarks ({bookmarks.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {bookmarks.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close bookmarks modal"
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 divide-y divide-stone-100 dark:divide-stone-800/80">
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center text-stone-400 dark:text-stone-500">
              <BookmarkIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-serif text-base text-stone-700 dark:text-stone-300">
                No bookmarked verses yet
              </p>
              <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                While reading any Surah, click the bookmark icon on any verse card to save it here for quick access.
              </p>
            </div>
          ) : (
            bookmarks.map((b) => (
              <div
                key={b.id}
                className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group"
              >
                <div 
                  onClick={() => {
                    onSelectBookmark(b.surahId, b.ayahNumber);
                    onClose();
                  }}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-serif font-semibold text-sm text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                      Surah {b.surahNameEnglish} · {b.surahNameArabic}
                    </span>
                    <span className="text-xs font-mono text-stone-400 tabular-nums">
                      [Ayah {b.ayahNumber}]
                    </span>
                    <span className="text-[10px] text-stone-400 font-sans ml-auto">
                      {new Date(b.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p
                    lang="ar"
                    dir="rtl"
                    className="font-quran-arabic text-lg text-stone-800 dark:text-stone-200 line-clamp-1 my-1 text-right"
                  >
                    {b.arabicSnippet}
                  </p>

                  {b.englishSnippet && (
                    <p
                      lang="en"
                      dir="ltr"
                      className="font-serif text-xs text-stone-600 dark:text-stone-400 line-clamp-2"
                    >
                      "{b.englishSnippet}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <button
                    onClick={() => {
                      onSelectBookmark(b.surahId, b.ayahNumber);
                      onClose();
                    }}
                    title="Open verse in reader"
                    aria-label={`Open Surah ${b.surahNameEnglish} Ayah ${b.ayahNumber}`}
                    className="p-1.5 text-stone-500 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onRemoveBookmark(b.id)}
                    title="Remove bookmark"
                    aria-label={`Remove bookmark for Surah ${b.surahNameEnglish} Ayah ${b.ayahNumber}`}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
