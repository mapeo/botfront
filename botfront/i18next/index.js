import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import PTBR from './locales/pt-BR/pt-br.json';
import ENUS from './locales/en-US/en-us.json';

const resources = {
    'en': ENUS,
    'ptBr': PTBR
}
i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'ptBr',
        interpolation: {
            escapeValue: false,
        }
    })

export default i18n;