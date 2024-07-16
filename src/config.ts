import { bundledThemesInfo as _bundledThemesInfo } from 'shiki/themes'
import { bundledLanguagesInfo as _bundledLanguagesInfo } from 'shiki/langs'

const bundledThemesInfo = _bundledThemesInfo.map((v) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { import: _, ...rest } = v
	return rest
})
const bundledThemes = bundledThemesInfo
export { bundledThemesInfo, bundledThemes }

const bundledLanguagesInfo = _bundledLanguagesInfo.map((v) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { import: _, ...rest } = v
	return rest
})

const bundledLanguagesBase = Object.fromEntries(
	bundledLanguagesInfo.map((i) => [i.id, i])
)
const bundledLanguagesAlias = Object.fromEntries(
	bundledLanguagesInfo.flatMap((i) => i.aliases?.map((a) => [a, i]) || [])
)
const bundledLanguages = {
	...bundledLanguagesBase,
	...bundledLanguagesAlias,
}

export {
	bundledLanguages,
	bundledLanguagesAlias,
	bundledLanguagesBase,
	bundledLanguagesInfo,
}

// const themeFlag = ['github-dark', 'github-light', 'nord', 'dark-plus',]
const themeFlag = bundledThemesInfo.map((v) => v.id)

export const defaultThemes = bundledThemesInfo.filter((v) =>
	themeFlag.includes(v.id)
)

export interface Settings {
	duration: number
	stagger: number
	lineNumbers: boolean
	theme: string
}

export const defaultSettings: Settings = {
	duration: 500,
	stagger: 0,
	lineNumbers: true,
	theme: 'github-dark',
}
