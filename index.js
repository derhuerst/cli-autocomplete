'use strict'

const ui =        require('cli-styles')
const chalk =     require('chalk')
const escapes =   require('ansi-escapes')
const stripAnsi = require('strip-ansi')
const keypress =  require('keypress')



const Prompt = {

	renderPrompt: function () { return [
		ui.symbol(this.done, this.aborted), this.text, ui.delimiter,
		this.done && this.cursor in this.suggestions
			? this.suggestions[this.cursor].title
			: this.transform(this.input)
	].join(' ') }

	, renderSuggestion: (cursor) =>
		(s, i) => i === cursor ? chalk.cyan(s.title) : s.title

	, linesRendered: 0

	, clear: function () { return ''
		// move to last rendered line
		+ (this.linesRendered > 0 ? escapes.cursorDown(this.linesRendered) : '')
		// move to first rendered line, deleting everything
		+ escapes.eraseLines(this.linesRendered + 1)
	}

	, render: function () {
		process.stdout.write(this.clear())

		if (this.done) {
			process.stdout.write(this.renderPrompt() + '\n')
			this.linesRendered = 2
		} else {
			let lines = [this.renderPrompt()]
				.concat(this.suggestions.map(this.renderSuggestion(this.cursor)))
			this.linesRendered = lines.length

			process.stdout.write(
				lines.join('\n')
				+ (lines.length > 1 ? escapes.cursorUp(lines.length - 1) : '')
				+ escapes.cursorTo(stripAnsi(lines[0]).length))
				// cursor is at the end of the first rendered line now
		}
	}



	, onKey: function (key) {
		this.input += key
		this.suggestions = this.suggest(this.input)
		this.render()
	}

	, up: function () {
		if (this.cursor === 0) this.cursor = this.suggestions.length - 1
		else this.cursor--
		this.render()
	}

	, down: function () {
		this.cursor = ++this.cursor % this.suggestions.length
		this.render()
	}

	, abort: function () {
		this.aborted = this.done = true
		this.render()
		this.close()
		this.reject(null)
	}

	, submit: function () {
		this.done = true
		this.render()
		this.close()

		if (this.cursor in this.suggestions)
			this.resolve(this.suggestions[this.cursor].value)
		else this.resolve(null)
	}

	, delete: function () {
		if (this.input.length === 0)
			return process.stdout.write(escapes.beep)

		this.input = this.input.slice(0, -1)
		this.suggestions = this.suggest(this.input)
		this.render()
	}



	, transform: ui.render()
	, suggest:   () => []
	, done:      false
	, aborted:   false
	, input:     ''
	, cursor:    0
	, resolve:   () => null
	, reject:    () => null

}

const prompt = function (text, opt) {
	let instance = Object.create(Prompt)

	if ('string' !== typeof text) throw new Error('text must be a string.')
	instance.text = text

	if (arguments.length < 2 || 'object' !== typeof opt) opt = {}
	if ('string' === typeof opt.type) instance.transform = ui.render(opt.type)
	if ('function' === typeof opt.suggest) instance.suggest = opt.suggest

	const onKeypress = function (raw, key) {
		let type = ui.keypress(raw, key)
		if (instance[type]) instance[type]()
		else instance.onKey(type)
	}
	keypress(process.stdin)
	process.stdin.on('keypress', onKeypress)

	const oldRawMode = process.stdin.isRaw
	process.stdin.setRawMode(true)
	process.stdin.on('end', () => instance.close())
	instance.close = () => {
		process.stdin.removeListener('keypress', onKeypress)
		process.stdin.setRawMode(oldRawMode)
	}

	instance.suggestions = instance.suggest(instance.input)
	instance.render()

	return new Promise(function (resolve, reject) {
		instance.resolve = resolve
		instance.reject =  reject
	})
}



module.exports = Object.assign(prompt, {Prompt})
