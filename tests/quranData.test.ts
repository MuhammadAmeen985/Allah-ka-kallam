import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DATA_DIR = path.resolve('public/data');
const SURAHS_META_PATH = path.join(PUBLIC_DATA_DIR, 'surahs.json');
const MANIFEST_PATH = path.join(PUBLIC_DATA_DIR, 'dataset-manifest.json');
const SURAH_DIR = path.join(PUBLIC_DATA_DIR, 'surah');

test('Dataset manifest exists and has valid Tanzil licensing & source', () => {
  assert.ok(fs.existsSync(MANIFEST_PATH), 'dataset-manifest.json must exist');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  assert.equal(manifest.source, 'Tanzil Project');
  assert.equal(manifest.totalSurahs, 114);
  assert.equal(manifest.totalAyahs, 6236);
  assert.ok(manifest.license.includes('Creative Commons Attribution 3.0'));
  assert.ok(manifest.sourceUrl.includes('tanzil.net'));
  assert.equal(manifest.translations.length, 2);
  assert.equal(manifest.translations[0].lang, 'en');
  assert.equal(manifest.translations[1].lang, 'ur');
});

test('All 114 Surahs exist in surahs.json metadata with sequential IDs 1 to 114', () => {
  assert.ok(fs.existsSync(SURAHS_META_PATH), 'surahs.json must exist');
  const surahs = JSON.parse(fs.readFileSync(SURAHS_META_PATH, 'utf8'));

  assert.equal(surahs.length, 114, 'Must have exactly 114 surahs');
  for (let i = 0; i < 114; i++) {
    const s = surahs[i];
    assert.equal(s.id, i + 1, `Surah at index ${i} must have id ${i + 1}`);
    assert.ok(s.nameArabic && s.nameArabic.length > 0, `Surah ${s.id} must have Arabic name`);
    assert.ok(s.nameTransliteration && s.nameTransliteration.length > 0, `Surah ${s.id} must have transliterated name`);
    assert.ok(s.nameEnglish && s.nameEnglish.length > 0, `Surah ${s.id} must have English name`);
    assert.ok(s.ayahCount > 0, `Surah ${s.id} must have positive ayah count`);
    assert.ok(s.revelationType === 'Meccan' || s.revelationType === 'Medinan');
  }

  // Key Surahs spot check
  assert.equal(surahs[0].nameArabic, 'الفاتحة');
  assert.equal(surahs[0].ayahCount, 7);
  assert.equal(surahs[1].nameArabic, 'البقرة');
  assert.equal(surahs[1].ayahCount, 286);
  assert.equal(surahs[113].nameArabic, 'الناس');
  assert.equal(surahs[113].ayahCount, 6);
});

test('Total Ayah count across all 114 Surahs matches exactly 6,236 (Kufic standard)', () => {
  const surahs = JSON.parse(fs.readFileSync(SURAHS_META_PATH, 'utf8'));
  const total = surahs.reduce((acc: number, s: { ayahCount: number }) => acc + s.ayahCount, 0);
  assert.equal(total, 6236, 'Total Quran verses must be exactly 6,236');
});

test('Every Surah file (1.json to 114.json) exists, parses cleanly, and maintains 1:1 verse alignment', () => {
  const surahs = JSON.parse(fs.readFileSync(SURAHS_META_PATH, 'utf8'));

  for (const s of surahs) {
    const filePath = path.join(SURAH_DIR, `${s.id}.json`);
    assert.ok(fs.existsSync(filePath), `Surah file ${s.id}.json must exist`);

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.equal(data.id, s.id);
    assert.equal(data.verses.length, s.ayahCount, `Surah ${s.id} verses count must match ayahCount`);

    for (let idx = 0; idx < data.verses.length; idx++) {
      const v = data.verses[idx];
      assert.equal(v.ayah, idx + 1, `Surah ${s.id} verse ${idx} must have sequential ayah number ${idx + 1}`);
      assert.ok(v.arabic && v.arabic.trim().length > 0, `Surah ${s.id}:${v.ayah} must have Arabic text`);
      assert.ok(v.translations.en && v.translations.en.text.trim().length > 0, `Surah ${s.id}:${v.ayah} must have English translation`);
      assert.ok(v.translations.ur && v.translations.ur.text.trim().length > 0, `Surah ${s.id}:${v.ayah} must have Urdu translation`);

      // Verify source attribution in each verse translation
      assert.ok(v.translations.en.source.includes('Tanzil'));
      assert.ok(v.translations.ur.source.includes('Tanzil'));
    }
  }
});
