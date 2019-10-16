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

	  		self.suggestions = suggestions
	  			.slice(0, self.limit)
	  			.map((s) => strip(s))
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



	, lastRendered: ''

	, render: function () {
		let prompt = [
			ui.symbol(this.done, this.aborted),
			this.msg,
			ui.delimiter(this.completing),
			this.done && this.suggestions[this.cursor]
				? this.suggestions[this.cursor].title
				: this.transform(this.input)
		].join(' ')

		if (!this.done) {
			prompt += esc.cursorSavePosition
			for (let i = 0; i < this.suggestions.length; i++) {
				const s = this.suggestions[i]
				prompt += '\n' + (i === this.cursor ? chalk.cyan(s.title) : s.title)
			}
			prompt += esc.cursorRestorePosition
		}

		this.out.write(ui.clear(this.lastRendered) + prompt)
		this.lastRendered = prompt
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
