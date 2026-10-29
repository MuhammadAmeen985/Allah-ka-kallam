import React from 'react';
import { ShieldCheck, ExternalLink, X, BookCheck, AlertCircle, Database } from 'lucide-react';
import { DatasetManifest } from '../types/quran';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: DatasetManifest | null;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, manifest }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
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
            <ShieldCheck className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <h2 id="about-modal-title" className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
              Data Authenticity & Sources
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close about modal"
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700 dark:text-stone-300">
          {/* Core Authenticity Declaration */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <BookCheck className="w-5 h-5 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-950 dark:text-emerald-200 text-sm">
                  100% Verified Authentic Source Text
                </h4>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 mt-1 leading-relaxed">
                  Every letter, diacritic mark (tashkeel), pause sign, and verse numbering in this application is loaded directly from the internationally recognized <strong>Tanzil Project</strong> verbatim Uthmani text. No artificial intelligence or generative reconstruction was used for any Quranic verse or translation.
                </p>
              </div>
            </div>
          </div>

          {/* Sources and Attributions */}
          <div>
            <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-stone-500" />
              <span>Official Datasets & Licenses</span>
            </h3>

            <div className="space-y-3">
              {/* Arabic Source */}
              <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    Arabic Quran Text: Tanzil Uthmani Text
                  </span>
                  <a
                    href="https://tanzil.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>tanzil.net</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  License: Creative Commons Attribution 3.0 (CC BY 3.0). Verbatim official edition.
                </p>
                <div className="mt-2 text-[11px] font-mono text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 p-2 rounded border border-stone-200 dark:border-stone-800">
                  Tanzil Quran Text Copyright (C) 2007-2024 Tanzil Project. This copy of the Quran text is carefully produced, highly verified and continuously monitored by a group of specialists in Tanzil Project.
                </div>
              </div>

              {/* English Source */}
              <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    English Translation: Saheeh International
                  </span>
                  <span className="text-xs text-stone-500">Edition: en.sahih</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Distributed via Tanzil Project under non-commercial attribution. Widely recognized for clarity, faithfulness to orthodox Islamic interpretation, and contemporary English phrasing.
                </p>
              </div>

              {/* Urdu Source */}
              <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    Urdu Translation: Fateh Muhammad Jalandhry (مولانا فتح محمد جالندھری)
                  </span>
                  <span className="text-xs text-stone-500">Edition: ur.jalandhry</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Classic, highly respected Urdu translation rendered in standard Nastaliq typography and full RTL direction alignment.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Scope Disclaimer */}
          <div className="border-t border-stone-200 dark:border-stone-800 pt-4">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-xs uppercase tracking-wider mb-2">
              Verification Scope & Scholarly Distinction
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              This application conducts automated structural and checksum validation ensuring that all 114 Surahs and 6,236 Ayahs correspond exactly to the Tanzil Project published dataset with 1:1 verse alignment. This technical verification is distinct from linguistic and theological scholarly authority, which remains credited to Tanzil Project specialists and the respective translators.
            </p>
          </div>

          {/* Privacy Note */}
          <div className="border-t border-stone-200 dark:border-stone-800 pt-4 flex items-center justify-between text-xs text-stone-500">
            <span>Reading history & bookmarks stored exclusively on your device (localStorage).</span>
            <span>Zero telemetry or tracking.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
