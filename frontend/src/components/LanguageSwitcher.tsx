import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-1 p-2 text-gray-500 hover:text-siddha-dark hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
        title={t('common.search')}
      >
        <Languages className="w-5 h-5" />
        <span className="text-xs font-semibold uppercase hidden sm:inline">
          {i18n.language === 'ta' ? 'தமிழ்' : 'EN'}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[120px] z-50">
          <button
            onClick={() => changeLanguage('en')}
            className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
              i18n.language === 'en'
                ? 'bg-siddha-light text-siddha-dark font-bold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            English
          </button>
          <button
            onClick={() => changeLanguage('ta')}
            className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
              i18n.language === 'ta'
                ? 'bg-siddha-light text-siddha-dark font-bold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            தமிழ்
          </button>
        </div>
      )}
    </div>
  );
}
