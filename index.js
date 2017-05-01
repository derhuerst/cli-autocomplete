'use strict'

const ui =    require('cli-styles')
const esc =   require('ansi-escapes')
const chalk = require('chalk')
const strip = require('strip-ansi')
const wrap =  require('prompt-skeleton')



const AutocompletePrompt = {

	  moveCursor: function (i) {
		this.cursor = i
		if (this.suggestions.length > 0) this.value = this.suggestions[i].value
		else this.value = null
		this.emit()
	}

	, complete: function (cb) {
		const self = this
	  	const p = this.completing = this.suggest(this.input)
	  	p.then((suggestions) => {
	  		if (this.completing !== p) return
	  		self.suggestions = suggestions.slice(0, self.limit)
			this.completing = false
			const l = Math.max(suggestions.length - 1, 0)
			self.moveCursor(Math.min(l, self.cursor))
			if (cb) cb()
	  	}).catch((err) => {
			self.emit('error', err)
		})
	}

	, reset: function () {
		const self = this
	  	this.input = ''
	  	this.complete(() => {
		  	self.moveCursor(0)
		  	self.render()
	  	})
	  	this.render()
	}

	, abort: function () {
		this.done = this.aborted = true
		this.emit()
		this.render()
		this.out.write('\n')
		this.close()
	}

	, submit: function () {
		this.done = true
		this.aborted = false
		this.emit()
		this.render()
		this.out.write('\n')
		this.close()
	}



	, _: function (c) {
		const self = this
	  	this.input += c
	  	this.complete(() => {
			self.render()
	  	})
	  	this.render()
	}
	, delete: function () {
		if (this.input.length === 0) return this.bell()
		const self = this
	  	this.input = this.input.slice(0, -1)
	  	this.complete(() => {
	  		self.render()
	  	})
		this.render()
	}



	, first: function () {
	  	this.moveCursor(0)
		this.render()
	}
	, last: function () {
	  	this.moveCursor(this.suggestions.length - 1)
		this.render()
	}

	, up: function () {
		if (this.cursor <= 0) return this.bell()
	  	this.moveCursor(this.cursor - 1)
		this.render()
	}
	, down: function () {
		if (this.cursor >= (this.suggestions.length - 1)) return this.bell()
	  	this.moveCursor(this.cursor + 1)
		this.render()
	}
	, next: function () {
		this.moveCursor((this.cursor + 1) % this.suggestions.length)
		this.render()
	}



	, linesRendered: 0
	, clear: function () {
		const r = this.linesRendered
		this.out.write(
			// move to last rendered line
			  (r > 0 ? esc.cursorDown(r) : '')
			// move to first rendered line, deleting everything
			+ esc.eraseLines(r + 1)
		)
	}

	, renderPrompt: function () {return [
		ui.symbol(this.done, this.aborted), this.msg,
		ui.delimiter(this.completing),
		this.done && (this.cursor in this.suggestions)
			? this.suggestions[this.cursor].title
			: this.transform(this.input)
	].join(' ')}

	, renderSuggestion: function (s, i) {
		return i === this.cursor ? chalk.cyan(s.title) : s.title
	}

	, render: function (first) {
		if (!first) this.clear()

		const prompt = this.renderPrompt()
		if (this.done) {
			this.out.write(prompt)
			this.linesRendered = 1
		} else {
			let out = [prompt].concat(this.suggestions
				.map(this.renderSuggestion.bind(this)))
			this.linesRendered = out.length

			this.out.write(out.join('\n')
				// move cursor back to first line
				+ (out.length > 1 ? esc.cursorUp(out.length - 1) : '')
				// move cursor to the end of the line
				+ esc.cursorTo(strip(out[0]).length))
		}
	}
}



const defaults = {
	  input:       ''
	, transform:   ui.render()

	, suggestions: []
	, limit:       10
	, completing:  null
	, cursor:      0
	, value:       null

	, done:        false
	, aborted:     false
}

const autocompletePrompt = (msg, suggest, opt) => {
	if ('string' !== typeof msg)
		throw new Error('Message must be a string.')
	if ('function' !== typeof suggest)
		throw new Error('Suggest must be a function.')
	if (Array.isArray(opt) || 'object' !== typeof opt) opt = {}

	let p = Object.assign(Object.create(AutocompletePrompt), defaults, opt)
	p.msg          = msg
	p.suggest      = suggest
	p.complete(() => p.render())

	return wrap(p)
}



module.exports = Object.assign(autocompletePrompt, {AutocompletePrompt})
