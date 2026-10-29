/**
 * Script to fetch authentic Quran text from Tanzil Project (https://tanzil.net)
 * License: Creative Commons Attribution 3.0 (CC BY 3.0)
 * Arabic Text: Tanzil Uthmani Text
 * English Translation: Saheeh International (en.sahih)
 * Urdu Translation: Fateh Muhammad Jalandhry (ur.jalandhry)
 */

import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DATA_DIR = path.resolve('public/data');
const SURAH_DIR = path.resolve(PUBLIC_DATA_DIR, 'surah');

fs.mkdirSync(SURAH_DIR, { recursive: true });

async function main() {
  console.log('1. Fetching Quran metadata from Tanzil (quran-data.xml)...');
  const metaRes = await fetch('https://tanzil.net/res/text/metadata/quran-data.xml');
  if (!metaRes.ok) throw new Error(`Failed to fetch quran-data.xml: ${metaRes.status}`);
  const xmlText = await metaRes.text();

  // Parse suras from XML
  const surahs = [];
  const suraRegex = /<sura\s+index="(\d+)"\s+ayas="(\d+)"\s+start="(\d+)"\s+name="([^"]+)"\s+tname="([^"]+)"\s+ename="([^"]+)"\s+type="([^"]+)"\s+order="(\d+)"\s+rukus="(\d+)"/g;
  let match;
  while ((match = suraRegex.exec(xmlText)) !== null) {
    surahs.push({
      id: parseInt(match[1], 10),
      nameArabic: match[4],
      nameTransliteration: match[5],
      nameEnglish: match[6],
      ayahCount: parseInt(match[2], 10),
      revelationType: match[7], // "Meccan" or "Medinan"
      revelationOrder: parseInt(match[8], 10),
      rukus: parseInt(match[9], 10),
      startAyahGlobal: parseInt(match[3], 10),
    });
  }

  console.log(`Parsed ${surahs.length} surahs metadata.`);
  if (surahs.length !== 114) {
    throw new Error(`Expected 114 surahs, but got ${surahs.length}`);
  }

  console.log('2. Fetching Arabic Uthmani text from Tanzil...');
  const arabicRes = await fetch('https://tanzil.net/pub/download/index.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0'
    },
    body: 'quranType=uthmani&outType=txt-aya&agree=true'
  });
  if (!arabicRes.ok) throw new Error(`Failed to fetch Arabic text: ${arabicRes.status}`);
  const arabicText = await arabicRes.text();

  console.log('3. Fetching English translation (Saheeh International) from Tanzil...');
  const enRes = await fetch('https://tanzil.net/trans/en.sahih');
  if (!enRes.ok) throw new Error(`Failed to fetch English translation: ${enRes.status}`);
  const enText = await enRes.text();

  console.log('4. Fetching Urdu translation (Fateh Muhammad Jalandhry) from Tanzil...');
  const urRes = await fetch('https://tanzil.net/trans/ur.jalandhry');
  if (!urRes.ok) throw new Error(`Failed to fetch Urdu translation: ${urRes.status}`);
  const urText = await urRes.text();

  // Helper to parse line-based pipe-separated text: surah|ayah|text
  function parseLines(raw) {
    const map = new Map();
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const parts = trimmed.split('|');
      if (parts.length >= 3) {
        const s = parseInt(parts[0], 10);
        const a = parseInt(parts[1], 10);
        const text = parts.slice(2).join('|').trim();
        if (!map.has(s)) map.set(s, new Map());
        map.get(s).set(a, text);
      }
    }
    return map;
  }

  const arabicMap = parseLines(arabicText);
  const enMap = parseLines(enText);
  const urMap = parseLines(urText);

  console.log(`Arabic surahs found: ${arabicMap.size}`);
  console.log(`English surahs found: ${enMap.size}`);
  console.log(`Urdu surahs found: ${urMap.size}`);

  let totalAyahsVerified = 0;

  // Build per-surah files
  for (const surah of surahs) {
    const sId = surah.id;
    const sArabic = arabicMap.get(sId);
    const sEn = enMap.get(sId);
    const sUr = urMap.get(sId);

    if (!sArabic) throw new Error(`Surah ${sId} missing in Arabic text`);
    if (!sEn) throw new Error(`Surah ${sId} missing in English text`);
    if (!sUr) throw new Error(`Surah ${sId} missing in Urdu text`);

    const verses = [];
    for (let aId = 1; aId <= surah.ayahCount; aId++) {
      const ar = sArabic.get(aId);
      const en = sEn.get(aId);
      const ur = sUr.get(aId);

      if (!ar) throw new Error(`Surah ${sId}:${aId} missing Arabic text`);
      if (!en) throw new Error(`Surah ${sId}:${aId} missing English text`);
      if (!ur) throw new Error(`Surah ${sId}:${aId} missing Urdu text`);

      verses.push({
        ayah: aId,
        arabic: ar,
        translations: {
          en: {
            text: en,
            translator: 'Saheeh International',
            source: 'Tanzil Project (tanzil.net)'
          },
          ur: {
            text: ur,
            translator: 'Fateh Muhammad Jalandhry (فتح محمد جالندھری)',
            source: 'Tanzil Project (tanzil.net)'
          }
        }
      });
      totalAyahsVerified++;
    }

    const surahData = {
      ...surah,
      verses
    };

    fs.writeFileSync(
      path.join(SURAH_DIR, `${sId}.json`),
      JSON.stringify(surahData, null, 2),
      'utf-8'
    );
  }

  console.log(`Successfully verified and wrote ${surahs.length} surahs with ${totalAyahsVerified} total ayahs!`);

  // Write surahs metadata list
  fs.writeFileSync(
    path.join(PUBLIC_DATA_DIR, 'surahs.json'),
    JSON.stringify(surahs, null, 2),
    'utf-8'
  );

  // Write dataset provenance and integrity manifest
  const datasetManifest = {
    source: 'Tanzil Project',
    sourceUrl: 'https://tanzil.net',
    license: 'Creative Commons Attribution 3.0 (CC BY 3.0)',
    licenseUrl: 'http://creativecommons.org/licenses/by/3.0/',
    retrievalDate: new Date().toISOString(),
    arabicEdition: 'Tanzil Uthmani Text (official verbatim copy)',
    translations: [
      {
        lang: 'en',
        name: 'English',
        translator: 'Saheeh International',
        edition: 'en.sahih',
        source: 'https://tanzil.net/trans/en.sahih',
        license: 'Free for non-commercial distribution with attribution'
      },
      {
        lang: 'ur',
        name: 'Urdu',
        translator: 'Fateh Muhammad Jalandhry (مولانا فتح محمد جالندھری)',
        edition: 'ur.jalandhry',
        source: 'https://tanzil.net/trans/ur.jalandhry',
        license: 'Public domain / Tanzil redistribution'
      }
    ],
    totalSurahs: surahs.length,
    totalAyahs: totalAyahsVerified,
    attributionNotice: 'Tanzil Quran Text Copyright (C) 2007-2024 Tanzil Project. This copy of the Quran text is carefully produced, highly verified and continuously monitored by a group of specialists in Tanzil Project. Source: http://tanzil.net'
  };

  fs.writeFileSync(
    path.join(PUBLIC_DATA_DIR, 'dataset-manifest.json'),
    JSON.stringify(datasetManifest, null, 2),
    'utf-8'
  );

  console.log('Dataset manifest written to public/data/dataset-manifest.json');
}

main().catch(err => {
  console.error('Data fetch error:', err);
  process.exit(1);
});
