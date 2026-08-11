'use client';

import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSelector() {
  const [lang, setLang] = useState<'VI' | 'EN'>('VI');
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectLanguage = (selectedLang: 'VI' | 'EN') => {
    setLang(selectedLang);
    setIsOpen(false);
    // Add logic here if actual i18n is implemented later
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-full border border-slate-700/50 transition-all duration-200"
      >
        <Globe className="w-4 h-4 text-brand-blue" />
        <span>{lang}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-28 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => selectLanguage('VI')}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                lang === 'VI' ? 'text-brand-blue font-semibold bg-brand-blue/10' : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              Tiếng Việt
            </button>
            <button
              onClick={() => selectLanguage('EN')}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                lang === 'EN' ? 'text-brand-blue font-semibold bg-brand-blue/10' : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              English
            </button>
          </div>
        </>
      )}
    </div>
  );
}
