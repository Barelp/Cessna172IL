import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    // Set initial direction based on language
    useEffect(() => {
        document.documentElement.dir = i18n.dir();
        document.documentElement.lang = i18n.language;
    }, [i18n, i18n.language]);

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div className="flex items-center bg-white/10 backdrop-blur-md rounded-lg border border-white/30 p-1">
            <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${i18n.language === 'en'
                        ? 'bg-white text-aviation-blue shadow-sm scale-105'
                        : 'text-white hover:bg-white/10 opacity-70 hover:opacity-100'
                    }`}
                aria-label="Switch to English"
            >
                EN
            </button>
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <button
                onClick={() => changeLanguage('he')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${i18n.language === 'he'
                        ? 'bg-white text-aviation-blue shadow-sm scale-105'
                        : 'text-white hover:bg-white/10 opacity-70 hover:opacity-100'
                    }`}
                aria-label="Switch to Hebrew"
            >
                HE
            </button>
        </div>
    );
}
