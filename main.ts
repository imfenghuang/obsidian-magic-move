import { Plugin, MarkdownView, App, EventRef } from 'obsidian'
import { createHighlighter } from 'shiki'
import type { HighlighterGeneric, BundledLanguage, BundledTheme } from 'shiki'
import {
	codeToKeyedTokens,
	createMagicMoveMachine,
} from 'shiki-magic-move/core'
import {
	createApp,
	ref,
	h,
	Suspense,
	watchEffect,
	computed,
	onMounted,
} from 'vue'
import type { Ref } from 'vue'
import { ShikiMagicMove } from 'shiki-magic-move/vue'
import { removeElemets, reCodeBlock } from './utils'

import { setLanguage } from './locale'
import type { LocaleType } from './locale'

import { SettingTab } from './setting'
import { defaultSettings, bundledLanguages, bundledThemes } from './config'
import type { Settings } from './config'

type EmptyObject = Record<string, unknown>
// type CacheMap = Map<string, string[]>;

type ObsidianMagicMoveType = {
	// $cache: CacheMap;
	$vue: {
		createApp: typeof createApp
		ref: typeof ref
		h: typeof h
		Suspense: typeof Suspense
		watchEffect: typeof watchEffect
		computed: typeof computed
		onMounted: typeof onMounted
	}
	$SMMVue: {
		ShikiMagicMove: typeof ShikiMagicMove
	}
	$SMMCore: {
		codeToKeyedTokens: typeof codeToKeyedTokens
		createMagicMoveMachine: typeof createMagicMoveMachine
	}
	$utils: {
		reCodeBlock: typeof reCodeBlock
	}
	$setting: Ref<Settings> | null
	$highlighterSetting: {
		$themes: typeof bundledThemes
		$languages: typeof bundledLanguages
		$highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>
	}
	$observerIns: IntersectionObserver | null
	$codeElements: Record<string, HTMLElement> | EmptyObject
	$app: App
}

declare global {
	interface Window {
		ObsidianMagicMove?: ObsidianMagicMoveType
	}
}

interface HTMLElementExtend extends HTMLElement {
	$matches?: Array<string[]>
	$insertCallback?: () => void
}

export default class ObsidianMagicMovePlugin extends Plugin {
	settings: Ref<Settings>
	settingTab: SettingTab
	$t: LocaleType
	private isNeedReRender: boolean
	private eventRefs: EventRef[] = []
	private scriptWrap: HTMLElement

	async onload() {
		await this.init()

		// reading mode
		// if restart and current mode is reading mode
		this.registerMarkdownPostProcessor(async (el, ctx) => {
			await this.readingMode(el)
		})

		// setting
		this.settingTab = new SettingTab(this.app, this)
		this.addSettingTab(this.settingTab)

		// restart
		this.app.workspace.onLayoutReady(() => {
			if (!this.isNeedReRender) return
			this.reRender()
		})
	}

	async readingMode(codeBlockElement: HTMLElement) {
		const codeElm: HTMLElementExtend | null =
			codeBlockElement.querySelector('pre > code.language-magic-move')

		if (!codeElm) return

		this.isNeedReRender = false

		codeElm.classList.add('magic-move-hidden')
		const innerText = codeElm.innerText
		const matches = Array.from(`${innerText}`.matchAll(reCodeBlock))
		codeElm['$matches'] = matches || []

		console.log(`${this.manifest.id} - matches: `, matches)

		if (!matches?.length) return

		const randomKey = Math.random().toString(36).slice(2)
		const queryClass = `__queryClass__${randomKey}`
		const queryScriptClass = `__queryScriptClass__${randomKey}`
		const mountClass = `__queryMountClass__${randomKey}`
		const tempClass = `__queryTempClass__${randomKey}`

		codeElm.classList.add(queryClass)

		window?.ObsidianMagicMove?.$observerIns?.observe?.(codeElm)

		codeElm['$insertCallback'] = () => {
			if (codeElm.classList.contains('is-scripted')) {
				return
			}

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			window!.ObsidianMagicMove!.$codeElements[queryClass] = codeElm

			const textContent = this.makeTextContent(
				queryClass,
				mountClass,
				tempClass
			)

			if (!textContent) {
				return
			}

			const script = this.scriptWrap.createEl('script')
			script.setAttribute('type', 'module')
			script.classList.add('magic-move-script')
			script.classList.add(queryScriptClass)
			script.textContent = textContent

			window?.ObsidianMagicMove?.$observerIns?.unobserve?.(codeElm)
			codeElm.classList.add('is-scripted')
		}
	}

	reRender() {
		this.app.workspace.iterateRootLeaves((currentLeaf) => {
			if (currentLeaf.view instanceof MarkdownView) {
				const leafMode = currentLeaf.view.getMode()
				if (leafMode === 'preview') {
					currentLeaf.view.previewMode.rerender(true)
				}
			}
		})
	}

	makeTextContent(queryClass: string, mountClass: string, tempClass: string) {
		return `
const $omm = window.ObsidianMagicMove
const $app = $omm.$app
const el = $omm.$codeElements['${queryClass}']

const { createApp, ref, h, Suspense, watchEffect, computed, onMounted } =
	$omm.$vue
const { ShikiMagicMove, ShikiMagicMovePrecompiled } = $omm.$SMMVue
const { codeToKeyedTokens, createMagicMoveMachine } = $omm.$SMMCore
const { reCodeBlock } = $omm.$utils

const setting = $omm.$setting
const {
	$languages: languages,
	$themes,
	$highlighter: highlighter,
} = $omm.$highlighterSetting

const matches = el?.$matches || []

const options = computed(() => {
	return {
		duration: setting.value.duration,
		stagger: setting.value.stagger,
		lineNumbers: setting.value.lineNumbers,
		theme: setting.value.theme,
	}
})

const childComponent = {
	async setup(props) {
		if (!matches.length) {
			return () => null
		}

		const lang = languages[matches?.[0]?.[1]]?.id || 'js'
		const theme = computed(() => options.value.theme)

		const codeSteps = matches.map((v) => v[5].trimEnd())
		const step = ref(0)
		const code = computed(() => codeSteps?.[step.value] || '')

		const machine = createMagicMoveMachine((code) =>
			codeToKeyedTokens(highlighter, code, {
				lineNumbers: options.value.lineNumbers,
				lang: languages[matches?.[step.value]?.[1]]?.id || lang,
				theme: theme.value,
			})
		)

		const compiledSteps = codeSteps.map(
			(code) => machine.commit(code).current
		)

		function prev() {
			step.value = step.value - 1 < 0 ? 0 : step.value - 1
		}

		function next() {
			step.value =
				step.value + 1 > matches.length - 1
					? matches.length - 1
					: step.value + 1
		}

		return () => [
			h(ShikiMagicMove, {
				lang: lang,
				theme: theme.value,
				highlighter,
				code: code.value,
				options: options.value,
			}),
			h(
				'div',
				{
					class: 'magic-move-navigation-wrap',
				},
				matches.length > 1 ? [
					h(
						'button',
						{
							class: 'magic-move-navigation-prev',
							disabled: step.value === 0,
							onClick: prev,
						},
						'${this.$t.navigation.prev}'
					),
					h(
						'button',
						{
							class: 'magic-move-navigation-next',
							disabled: step.value === matches.length - 1,
							onClick: next,
						},
						'${this.$t.navigation.next}'
					),
				] : null
			),
		]
	},
}

const div = document.createElement('div')
div.classList.add('${tempClass}')
div.classList.add('magic-move-temp')

const app = createApp({
	setup() {
		onMounted(() => {
			$omm?.$observerIns?.unobserve(div)
			// div.remove()
		})
		return () =>
			h(Suspense, null, {
				default: () => h(Child),
				fallback: () => '',
			})
	},
})

app.component('magic-move-child', childComponent)
const Child = app.component('magic-move-child')

el.insertBefore(div, el.firstChild)

div['$insertCallback'] = () => {
	const temp = $app.workspace.activeEditor?.contentEl?.querySelector?.(
		'.markdown-preview-view.markdown-rendered .${tempClass}'
	)
	if (temp?.parentNode?.parentNode?.parentNode) {
		const newDiv = document.createElement('div')
		newDiv.classList.add('magic-move-wrap')
		newDiv.classList.add('${mountClass}')
		app.mount(newDiv)
		temp.parentNode.parentNode.parentNode.appendChild(newDiv)
		$omm.$codeElements['${queryClass}'] = null
		$omm?.$observerIns?.unobserve(div)
	}
}
$omm?.$observerIns?.observe(div)
        `
	}

	onunload() {
		this.removeEvents()

		removeElemets(['.magic-move-script', '.magic-move-wrap'])

		this.scriptWrap.remove()

		window?.ObsidianMagicMove?.$observerIns?.disconnect?.()
		window?.ObsidianMagicMove?.$highlighterSetting?.$highlighter?.dispose?.()
		delete window['ObsidianMagicMove']
	}

	removeEvents() {
		for (const eventRef of this.eventRefs) {
			this.app.workspace.offref(eventRef)
		}
	}

	async init() {
		const scriptWrap = document.body.createEl('div')
		scriptWrap.classList.add('magic-move-script-wrap')
		this.scriptWrap = scriptWrap

		this.settings = ref(defaultSettings)

		const highlighter = await createHighlighter({
			themes: bundledThemes.map((v) => v.id),
			langs: Object.keys(bundledLanguages),
		})

		window.ObsidianMagicMove = {
			$app: this.app,
			$codeElements: {},
			$observerIns: null,
			// $cache: new Map(),
			$vue: {
				createApp,
				ref,
				h,
				Suspense,
				watchEffect,
				computed,
				onMounted,
			},

			$SMMVue: {
				ShikiMagicMove,
			},

			$SMMCore: {
				codeToKeyedTokens,
				createMagicMoveMachine,
			},

			$utils: {
				reCodeBlock,
			},

			$highlighterSetting: {
				$languages: bundledLanguages,
				$themes: bundledThemes,
				$highlighter: highlighter,
			},

			$setting: null,
		}

		this.observer()

		this.initLocale()
		await this.loadSettings()

		this.isNeedReRender = true
	}

	observer() {
		; (
			window?.ObsidianMagicMove?.$observerIns as IntersectionObserver
		)?.disconnect?.()

		const options = {
			root: null,
			rootMargin: '0px',
			threshold: 0,
		}
		const callback: IntersectionObserverCallback = (
			entries: IntersectionObserverEntry[]
		) => {
			entries.forEach((el) => {
				if (el.isIntersecting) {
					const $insertCallback = (el.target as HTMLElementExtend)
						?.$insertCallback
					if (typeof $insertCallback === 'function') {
						$insertCallback()
					}
				}
			})
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		window!.ObsidianMagicMove!.$observerIns = new IntersectionObserver(
			callback,
			options
		)
	}

	initLocale() {
		this.$t = setLanguage(window.localStorage.getItem('language'))
	}

	async loadSettings() {
		this.settings = ref(
			Object.assign({}, defaultSettings, await this.loadData())
		)
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		window!.ObsidianMagicMove!.$setting = this.settings
	}

	async saveSettings() {
		await this.saveData(this.settings.value)
	}
}
