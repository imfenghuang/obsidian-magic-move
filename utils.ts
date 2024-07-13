export const removeElemets = (selector: string | string[]) => {
	const selectors = Array.isArray(selector) ? selector : [selector]
	selectors.forEach((selector) => {
		const elList = document.querySelectorAll(selector)
		elList?.forEach((el) => el.remove())
	})
}

export function normalizeRangeStr(rangeStr = '') {
	return !rangeStr.trim()
		? []
		: rangeStr
				.trim()
				.split(/\|/g)
				.map((i) => i.trim())
}

export const reCodeBlock =
	/^```([\w'-]+)(?:\s*\{([\w*,|-]+)\}\s*?(\{[^}]*\})?([^\r\n]*))?\r?\n(\S[\s\S]*?)^```$/gm
	
export const reMagicMoveBlock =
	/^````magic-move(?: *(\{[^}]*\})?([^\n]*))?\n([\s\S]+?)^````$/gm

export function parseLineNumbersOption(options: string) {
	return /lines: *true/.test(options)
		? true
		: /lines: *false/.test(options)
			? false
			: undefined
}
