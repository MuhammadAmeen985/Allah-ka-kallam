# Contributing to The Holy Quran Web App

Thank you for your interest in contributing to **The Holy Quran — القرآن الكريم**.

## 1. Prime Directive: Quranic Data Integrity

The absolute integrity, authenticity, and verbatim preservation of the Quranic text takes precedence over all other considerations.

When contributing:
1. **Never alter or "fix" Arabic Quranic text**: All text is sourced directly from the Tanzil Project. If you suspect an anomaly, it must be reported to [Tanzil Project](https://tanzil.net) directly.
2. **Never use Generative AI to supply missing Quranic text**: Any PR utilizing AI to generate or reconstruct Quranic verses will be immediately closed.
3. **Never add unauthorized translations**: Only translations with clear scholarly provenance, identified editions, and appropriate redistribution licenses will be considered.

## 2. Development Workflow

1. Fork the repository and create your branch from `main`.
2. Make your improvements to the reader interface, accessibility, search performance, or styling.
3. Ensure automated tests pass:
   ```bash
   npx tsx --test tests/quranData.test.ts tests/search.test.ts
   npm run build
   ```
4. Verify accessibility and responsive layout across both mobile and desktop viewports.
5. Open a Pull Request with a clear description of your changes.

## 3. Code Standards

- **TypeScript**: Strict type checking.
- **Styling**: Tailwind CSS with CSS custom variables for light, dark, and sepia/parchment palettes.
- **Accessibility**: Semantic HTML, visible focus states, WCAG AA contrast compliance, proper `lang` and `dir` tags.
