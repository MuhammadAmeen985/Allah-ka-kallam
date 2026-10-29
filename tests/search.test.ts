import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeArabicForSearch,
  normalizeEnglishForSearch,
  normalizeUrduForSearch,
  parseAyahReference
} from '../src/utils/arabicSearch';

test('parseAyahReference parses various coordinate formats correctly', () => {
  // Format 1: 2:255
  assert.deepEqual(parseAyahReference('2:255'), { surahId: 2, ayahNumber: 255 });
  assert.deepEqual(parseAyahReference('01:7'), { surahId: 1, ayahNumber: 7 });
  assert.deepEqual(parseAyahReference('114:6'), { surahId: 114, ayahNumber: 6 });

  // Format 2: surah 2 ayah 255
  assert.deepEqual(parseAyahReference('surah 2 ayah 255'), { surahId: 2, ayahNumber: 255 });
  assert.deepEqual(parseAyahReference('sura 36 aya 1'), { surahId: 36, ayahNumber: 1 });
  assert.deepEqual(parseAyahReference('s112 a1'), { surahId: 112, ayahNumber: 1 });

  // Format 3: "2 255"
  assert.deepEqual(parseAyahReference('2 255'), { surahId: 2, ayahNumber: 255 });

  // Invalid queries return null
  assert.equal(parseAyahReference('hello world'), null);
  assert.equal(parseAyahReference('200:1'), null); // Surah 200 does not exist
});

test('normalizeArabicForSearch strips harakat, tashkeel, and normalizes alif variants', () => {
  // Stripping harakat from Bismillah
  const raw = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
  const normalized = normalizeArabicForSearch(raw);

  // Must not have harakat (kasra, shadda, fatha, dagger alif, sukun)
  assert.ok(!normalized.includes('\u0650'), 'Must not contain kasra');
  assert.ok(!normalized.includes('\u064E'), 'Must not contain fatha');
  assert.ok(!normalized.includes('\u0651'), 'Must not contain shadda');

  // Should contain normalized root characters: بسم الله الرحمن الرحيم
  assert.ok(normalized.includes('بسم'));
  assert.ok(normalized.includes('الله'));
  assert.ok(normalized.includes('الرحمن'));
  assert.ok(normalized.includes('الرحيم'));

  // Alif forms normalization (أ, إ, آ, ٱ -> ا) and tashkeel removal
  assert.equal(normalizeArabicForSearch('إِنَّآ أَعْطَيْنَٰكَ'), 'انا اعطينك');
});

test('normalizeEnglishForSearch normalizes punctuation, case, and whitespace', () => {
  assert.equal(normalizeEnglishForSearch('The Entirely Merciful!'), 'the entirely merciful');
  assert.equal(normalizeEnglishForSearch('Allah—the Eternal Refuge.'), 'allahthe eternal refuge');
});

test('normalizeUrduForSearch normalizes characters for reliable search', () => {
  const norm = normalizeUrduForSearch('شروع الله کا نام لے کر جو بڑا مہربان نہایت رحم والا ہے');
  assert.ok(norm.includes('مہربان'));
  assert.ok(norm.includes('رحم'));
});
