import { App, PluginSettingTab, Component, Setting } from 'obsidian'
import { defaultThemes } from './config'
import ObsidianMagicMovePlugin from './main'
import { getLocal } from './locale'
import type { LocaleType } from './locale'

export class SettingTab extends PluginSettingTab {
	private $t: LocaleType['settingTab']
	private component: Component
	name: string

	constructor(
		app: App,
		public plugin: ObsidianMagicMovePlugin
	) {
		super(app, plugin)
		this.component = new Component()
	}

	display(): void {
		this.$t = getLocal()['settingTab']
		const {
			durationDesc = '',
			durationPlaceholder = '',
			staggerDesc = '',
			staggerPlaceholder = '',
			lineNumbersDesc = '',
		} = this.$t || {}
		const { containerEl } = this
		this.component.load()
		containerEl.empty()

		const settings = this.plugin.settings

		new Setting(containerEl)
			.setName('duration')
			.setDesc(durationDesc)
			.addText((text) =>
				text
					.setPlaceholder(durationPlaceholder)
					.setValue(`${settings.value.duration}`)
					.onChange(async (value) => {
						settings.value.duration = +value >= 100 ? +value : 500
						await this.plugin.saveSettings()
					})
			)

		new Setting(containerEl)
			.setName('stagger')
			.setDesc(staggerDesc)
			.addText((text) =>
				text
					.setPlaceholder(staggerPlaceholder)
					.setValue(`${settings.value.stagger}`)
					.onChange(async (value) => {
						settings.value.stagger = +value >= 0 ? +value : 0
						await this.plugin.saveSettings()
					})
			)

		new Setting(containerEl)
			.setName('lineNumbers')
			.setDesc(lineNumbersDesc)
			.addToggle((toggle) => {
				toggle
					.setValue(settings.value.lineNumbers)
					.onChange(async (value) => {
						settings.value.lineNumbers = value
						await this.plugin.saveSettings()
					})
			})

		new Setting(containerEl)
			.setName('theme')
			.setDesc('')
			.addDropdown((dropdown) => {
				for (const option of defaultThemes) {
					dropdown.addOption(option.id, option.displayName)
				}
				dropdown.setValue(settings.value.theme)
				dropdown.onChange(async (value) => {
					settings.value.theme = value
					await this.plugin.saveSettings()
				})
			})
	}

	hide(): void {
		this.component.unload()
	}
}
