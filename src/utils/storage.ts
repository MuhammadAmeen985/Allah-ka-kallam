import { Bookmark, LastReadPosition, ReadingPreferences } from '../types/quran';

const BOOKMARKS_KEY = 'holy_quran_bookmarks_v1';
const LAST_READ_KEY = 'holy_quran_last_read_v1';
const PREFERENCES_KEY = 'holy_quran_preferences_v1';

export const DEFAULT_PREFERENCES: ReadingPreferences = {
  theme: 'light',
  arabicFontSize: 28,
  translationFontSize: 16,
  showArabic: true,
  showEnglish: true,
  showUrdu: true,
  readerMode: 'cards',
  arabicFontFamily: 'amiri',
};

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__quran_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getBookmarks(): Bookmark[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Could not read bookmarks from storage:', err);
    return [];
  }
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (err) {
    console.warn('Could not save bookmarks to storage:', err);
  }
}

export function toggleBookmark(bookmark: Bookmark): boolean {
  const current = getBookmarks();
  const existingIndex = current.findIndex(b => b.id === bookmark.id);
  if (existingIndex >= 0) {
    // Remove
    current.splice(existingIndex, 1);
    saveBookmarks(current);
    return false; // Not bookmarked anymore
  } else {
    // Add to beginning
    current.unshift(bookmark);
    saveBookmarks(current);
    return true; // Now bookmarked
  }
}

export function isBookmarked(surahId: number, ayahNumber: number): boolean {
  const current = getBookmarks();
  const targetId = `surah-${surahId}-ayah-${ayahNumber}`;
  return current.some(b => b.id === targetId);
}

export function removeBookmark(id: string): Bookmark[] {
  const current = getBookmarks().filter(b => b.id !== id);
  saveBookmarks(current);
  return current;
}

export function getLastRead(): LastReadPosition | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(LAST_READ_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read last read position:', err);
    return null;
  }
}

export function setLastRead(pos: LastReadPosition): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(LAST_READ_KEY, JSON.stringify(pos));
  } catch (err) {
    console.warn('Could not save last read position:', err);
  }
}

export function getPreferences(): ReadingPreferences {
  if (!isLocalStorageAvailable()) return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (err) {
    console.warn('Could not read preferences:', err);
    return DEFAULT_PREFERENCES;
  }
}

export function setPreferences(pref: Partial<ReadingPreferences>): ReadingPreferences {
  const updated = { ...getPreferences(), ...pref };
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not save preferences:', err);
    }
  }
  return updated;
}
