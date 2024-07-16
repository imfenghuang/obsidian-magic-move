import zhCn from './zh-cn'
import en from './en'

type LangType = 'zh-cn' | 'en'

const localeMap = {
	zh: zhCn,
	'zh-cn': zhCn,
	en: en,
}

let lang: LangType = 'en'
let locale = localeMap[lang]
const localeKey = Object.keys(localeMap)

export type LocaleType = typeof locale

export function setLanguage(newLang: LangType | string | null) {
	if (newLang === null || !localeKey.includes(newLang)) newLang = 'en'
	lang = newLang as LangType
	locale = localeMap[lang || 'en']
	return locale
}

export function getLocal() {
	let lang = window.localStorage.getItem('language')
	if (!localeKey.includes(`${lang}`)) lang = 'en'
	return localeMap[lang as LangType]
}
