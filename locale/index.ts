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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (!localeKey.includes(newLang as any)) newLang = 'en'
	lang = newLang as LangType
	locale = localeMap[lang || 'en']
	return locale
}

export function getLocal() {
	let lang = window.localStorage.getItem('language')
	if (!localeKey.includes(`${lang}`)) lang = 'en'
	return localeMap[lang as LangType]
}
