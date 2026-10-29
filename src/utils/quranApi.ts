import { DatasetManifest, SurahDetail, SurahMeta } from '../types/quran';

// Ensure base URL works both locally and on GitHub Pages subpaths
const BASE_PATH = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

let cachedSurahs: SurahMeta[] | null = null;
let cachedManifest: DatasetManifest | null = null;
let cachedSearchIndex: any[] | null = null;

export async function fetchSurahList(): Promise<SurahMeta[]> {
  if (cachedSurahs) return cachedSurahs;
  const res = await fetch(`${BASE_PATH}/data/surahs.json`);
  if (!res.ok) {
    throw new Error(`Failed to load Surah index (status ${res.status})`);
  }
  const data: SurahMeta[] = await res.json();
  cachedSurahs = data;
  return data;
}

export async function fetchSurahDetail(surahId: number): Promise<SurahDetail> {
  if (surahId < 1 || surahId > 114) {
    throw new Error(`Invalid Surah number: ${surahId}. Must be between 1 and 114.`);
  }
  const res = await fetch(`${BASE_PATH}/data/surah/${surahId}.json`);
  if (!res.ok) {
    throw new Error(`Failed to load Surah ${surahId} (status ${res.status})`);
  }
  const data: SurahDetail = await res.json();
  return data;
}

export async function fetchDatasetManifest(): Promise<DatasetManifest> {
  if (cachedManifest) return cachedManifest;
  const res = await fetch(`${BASE_PATH}/data/dataset-manifest.json`);
  if (!res.ok) {
    throw new Error(`Failed to load dataset manifest (status ${res.status})`);
  }
  const data: DatasetManifest = await res.json();
  cachedManifest = data;
  return data;
}

export async function fetchSearchIndex(): Promise<any[]> {
  if (cachedSearchIndex) return cachedSearchIndex;
  const res = await fetch(`${BASE_PATH}/data/search-index.json`);
  if (!res.ok) {
    throw new Error(`Failed to load search index (status ${res.status})`);
  }
  const data = await res.json();
  cachedSearchIndex = data;
  return data;
}
