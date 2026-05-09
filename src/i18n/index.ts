import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import sr from './sr.json';

const STORAGE_KEY = "lang";

function detectLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved && ["en", "sr"].includes(saved)) {
        return saved;
    };

    const nav = navigator.language?.toLowerCase() ?? "en";

    return nav.startsWith("sr") ? "sr" : "en";
}

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        sr: { translation: sr },
    },
    lng: detectLanguage(),
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

export { STORAGE_KEY }
export default i18n;