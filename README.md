# The Holy Quran — القرآن الكريم

> **Read. Reflect. Learn.**  
> A respectful, accessible, and authentic multilingual Quran web application featuring verified Uthmani Arabic text with English (*Saheeh International*) and Urdu (*Fateh Muhammad Jalandhry*) translations.

[![Quran Data Integrity: Verified](https://img.shields.io/badge/Quran%20Data-100%25%20Verified%20(Tanzil)-065f46.svg)](#data-sources-and-attribution)
[![License: MIT + CC BY 3.0](https://img.shields.io/badge/License-MIT%20%2B%20CC%20BY%203.0-b45309.svg)](#licensing)
[![114 Surahs / 6236 Verses](https://img.shields.io/badge/Verses-6%2C236%20Ayahs-10b981.svg)](#technical-architecture)

---

## 1. Project Purpose

The purpose of **The Holy Quran — القرآن الكريم** is to provide a serene, authentic, and distraction-free digital Quran reading sanctuary across mobile, tablet, and desktop devices. 

Authenticity and data integrity are the foundational priorities of this application:
- Every verse of the Arabic Quran text is an exact, verbatim copy from the authoritative **Tanzil Project** ([tanzil.net](https://tanzil.net)).
- No artificial intelligence, generative models, or heuristics were used to generate, paraphrase, or reconstruct any Quranic verse or translation.
- The application is 100% client-side and privacy-preserving: bookmarks and reading progress are stored locally on the user's device without server tracking or telemetry.

---

## 2. Key Features

### 📖 Quran Reader
- **114 Complete Surahs**: Full reading navigation from Surah 1 (*Al-Fatihah*) to Surah 114 (*An-Naas*).
- **Multilingual Verse Alignment**: Every single one of the 6,236 Ayahs is mapped 1:1 with authentic Arabic Uthmani text, Saheeh International English translation, and Maulana Fateh Muhammad Jalandhry Urdu translation.
- **Display Modes**:
  - Arabic Only (Classical Mushaf view)
  - Arabic + English
  - Arabic + Urdu
  - Arabic + English + Urdu (Comprehensive comparative study)
- **Continuous vs. Verse-by-Verse Cards**: Toggle between modern verse cards and continuous flowing reading.
- **Customizable Typography**: Real-time adjustable Arabic font size (20px to 44px) and translation font size (13px to 22px).
- **Trilingual Theming**:
  - **Light Canvas**: Archival alabaster background with deep emerald accents.
  - **Parchment / Sepia**: Warm sepia tones for reduced eye strain during extended reading.
  - **Dark Mode**: High-contrast, optical-compensated nocturnal reading.
- **Directional Integrity**: Strict `dir="rtl"` for Arabic and Urdu, `dir="ltr"` for English, with appropriate Unicode language tags.

### 🔍 Instant Multilingual Search
- **Coordinate Reference Parsing**: Instant jump to any verse reference (e.g. `2:255`, `36:1`, `surah 2 ayah 255`, `112:1`).
- **Surah Index Search**: Search across Surah names in English, transliteration, Arabic, or Surah number.
- **Arabic Text Search**: Strips diacritics and normalizes letter forms strictly in a temporary matching index without ever modifying or mutating the original displayed Quranic text.
- **English & Urdu Translation Search**: Instant keyword search across all 6,236 verses.

### 🔖 Bookmarks & Reading Progress
- **Save Favorite Ayahs**: One-click bookmarking of any verse with instant notification.
- **Quick Jump & Removal**: View all saved bookmarks in a dedicated modal and jump straight to that verse.
- **Automatic Last Read**: Resumes your reading from where you left off.
- **Local & Private**: Stored in standard browser `localStorage` with resilient error handling when cookies or storage are restricted.

### 🌟 Daily Ayah & Curated Reflections
- Daily Ayah featured on the home page with verified Arabic, English, and Urdu translations.
- One-click copy with full citation and "Read in Context" action.

---

## 3. Supported Languages

| Language | Role | Typography Stack | Direction |
| :--- | :--- | :--- | :--- |
| **Arabic (العربية)** | Original Sacred Text | Amiri, Scheherazade New, Traditional Arabic | Right-to-Left (RTL) |
| **English** | Translation (Saheeh International) | Cormorant Garamond, Plus Jakarta Sans | Left-to-Right (LTR) |
| **Urdu (اردو)** | Translation (Fateh Muhammad Jalandhry) | Noto Nastaliq Urdu, Jameel Noori Nastaleeq | Right-to-Left (RTL) |

---

## 4. Data Sources and Attribution

### Official Tanzil Project Notice
This application uses the authentic Quran text produced by the **Tanzil Project**:

```text
Tanzil Quran Text Copyright (C) 2007–2024 Tanzil Project
License: Creative Commons Attribution 3.0 (http://creativecommons.org/licenses/by/3.0/)

This copy of the Quran text is carefully produced, highly verified and continuously monitored by a group of specialists in Tanzil Project.
- Source: http://tanzil.net
```

### Editions Integrated
1. **Arabic Text**: Tanzil Uthmani Text (`quranType=uthmani`), verified against standard Madinah Mushaf orthography.
2. **English Translation**: Saheeh International (`en.sahih`), provided via Tanzil Project.
3. **Urdu Translation**: Maulana Fateh Muhammad Jalandhry (`ur.jalandhry`), provided via Tanzil Project.
4. **Surah Metadata**: Tanzil Project `quran-data.xml` v1.0.

See [`VERIFICATION_REPORT.md`](./VERIFICATION_REPORT.md) for full technical validation details.

---

## 5. Installation and Local Development

### Prerequisites
- [Node.js](https://nodejs.org) v18.0.0 or higher
- npm or yarn

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/your-username/The-Holy-Quran.git
cd The-Holy-Quran

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open http://localhost:3000 in your browser
```

### Building for Production
```bash
# Create an optimized static build in the dist/ folder
npm run build

# Preview production build locally
npm run preview
```

### Running Automated Integrity Tests
```bash
# Runs full test suite verifying all 114 Surahs and 6,236 Ayahs
npx --yes tsx --test tests/quranData.test.ts tests/search.test.ts
```

---

## 6. Repository Structure

```text
The-Holy-Quran/
├── public/
│   └── data/
│       ├── surahs.json              # Metadata for all 114 Surahs
│       ├── dataset-manifest.json    # Licensing, attribution & verification manifest
│       ├── search-index.json        # Compact multilingual search index (6,236 verses)
│       └── surah/
│           ├── 1.json               # Surah Al-Fatihah (7 ayahs, Ar + En + Ur)
│           ├── 2.json               # Surah Al-Baqarah (286 ayahs)
│           └── ... 114.json         # Surah An-Naas
├── src/
│   ├── components/
│   │   ├── Navbar.tsx               # Top bar adhering to 3-zone contract
│   │   ├── DailyAyahCard.tsx        # Daily verified Ayah component
│   │   ├── SurahCard.tsx            # Surah directory card
│   │   ├── SurahDirectory.tsx       # 114 Surahs filterable directory
│   │   ├── QuranReader.tsx          # Full reader with multilingual display modes
│   │   ├── SearchModal.tsx          # Coordinate, keyword & full-text search
│   │   ├── BookmarksModal.tsx       # Saved verses management
│   │   ├── AboutModal.tsx           # Dataset attribution & licensing modal
│   │   └── Toast.tsx                # Notification feedback
│   ├── types/
│   │   └── quran.ts                 # Strong TypeScript schemas
│   ├── utils/
│   │   ├── arabicSearch.ts          # Search normalization & reference parsing
│   │   ├── dailyAyahs.ts            # Curated verified daily verses
│   │   ├── quranApi.ts              # Data fetcher supporting relative paths
│   │   └── storage.ts               # Resilient localStorage utility
│   ├── App.tsx                      # Root application component
│   ├── main.tsx                     # React entry point
│   └── index.css                    # Tailwind CSS v4 & typography styles
├── tests/
│   ├── quranData.test.ts            # Node.js test runner suite for dataset integrity
│   └── search.test.ts               # Unit tests for search normalization & parsing
├── scripts/
│   └── fetch-tanzil-data.js         # Tanzil data extraction & verification script
├── VERIFICATION_REPORT.md           # Formal verification report
├── CITATION.cff                     # Scholarly citation file
├── CONTRIBUTING.md                  # Contribution guidelines
├── CODE_OF_CONDUCT.md               # Code of conduct
└── LICENSE                          # MIT code license + CC BY 3.0 Tanzil notice
```

---

## 7. GitHub Pages Deployment

The application is engineered as a static web application that can be hosted on GitHub Pages, Cloudflare Pages, Vercel, or Netlify.

### Beginner-Friendly Deployment Guide

1. **Create a new repository on GitHub:**
   - Go to [github.com/new](https://github.com/new).
   - Name the repository: `The-Holy-Quran`.
   - Choose **Public**. Do not initialize with README (we already have one).

2. **Initialize Git and commit your project:**
   ```bash
   git init
   git add .
   git commit -m "feat: complete multilingual Quran web application with verified Tanzil datasets"
   ```

3. **Link to your GitHub remote and push:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/The-Holy-Quran.git
   git push -u origin main
   ```

4. **Deploy with GitHub Actions (Recommended):**
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: false

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4
         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: 20
         - name: Install dependencies
           run: npm ci
         - name: Run verification tests
           run: npx tsx --test tests/quranData.test.ts tests/search.test.ts
         - name: Build static site
           run: npm run build
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: ./dist

     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       needs: build
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

5. **Enable GitHub Pages:**
   - In your repository, go to **Settings** > **Pages**.
   - Under **Build and deployment**, set **Source** to **GitHub Actions**.
   - Your site will be published at `https://<your-username>.github.io/The-Holy-Quran/`!

---

## 8. Licensing

- **Software Source Code**: Released under the [MIT License](./LICENSE).
- **Quran Text**: Sourced from the **Tanzil Project** ([tanzil.net](https://tanzil.net)) and licensed under [Creative Commons Attribution 3.0 (CC BY 3.0)](http://creativecommons.org/licenses/by/3.0/). Verbatim copying and redistribution is permitted with attribution.
- **Translations**: Saheeh International (English) and Maulana Fateh Muhammad Jalandhry (Urdu), provided through Tanzil Project.

---

## 9. Known Limitations

1. **Audio Recitation**: As specified by community guidelines, audio recitation is intentionally not included to ensure that only appropriately licensed, scholarly verified audio tracks are integrated in future updates.
2. **Translation Selection**: Currently includes English (*Saheeh International*) and Urdu (*Fateh Muhammad Jalandhry*). Additional verified languages (e.g. French, Turkish, Indonesian) may be added following the same strict Tanzil verification pipeline.
3. **Scholarly Authority**: The automated verification performed in this repository tests dataset integrity and 1:1 verse alignment; theological and linguistic authority remains credited to Tanzil Project specialists and respective translators.
